import type { Core as Instance } from 'style-dictionary-esm'
import StyleDictionary from 'style-dictionary-esm'
import { isShadowToken, transformShadow } from '../utils/shadows'
import type { PinceauOptions, PinceauTheme, PinceauTokens, ThemeGenerationOutput } from '../types'
import { logger } from '../utils'
import { jsFlat, jsFull, tsFlat, tsFull, tsTypesDeclaration } from './formats'

export async function generateTheme(tokens: PinceauTheme, { outputDir: buildPath, colorSchemeMode, debug }: PinceauOptions, silent = true): Promise<ThemeGenerationOutput> {
  let styleDictionary: Instance = StyleDictionary

  // Tokens outputs as in-memory objects
  const outputs: ThemeGenerationOutput['outputs'] = {}

  let result = {
    tokens: {} as PinceauTheme,
    outputs: {} as { [key: string]: any },
    buildPath,
  }

  // Skip generation if no tokens provided
  if (!tokens || typeof tokens !== 'object' || !Object.keys(tokens).length) {
    return result
  }

  // Responsive tokens
  const mqKeys = ['dark', 'light', Object.keys(tokens?.media || [])]
  const responsiveTokens = {}

  // Tokens processed through dictionary
  let transformedTokens: PinceauTokens
  let transformedTokensTyping: any

  // Cleanup default fileHeader
  styleDictionary.fileHeader = {}

  // Prepare tokens, and walk them once
  styleDictionary.registerAction({
    name: 'prepare',
    do: (dictionary) => {
      transformedTokens = walkTokens(
        dictionary.tokens,
        (token) => {
          if (
            // Skip if token has no original value
            !token?.original?.value
            // Skip if token has array value (TODO: Handle arrays and objects)
            || !(typeof token.original.value === 'string' || typeof token.original.value === 'string')
          ) { return token }

          return token
        },
      )

      transformedTokensTyping = walkTokens(
        dictionary.tokens,
        () => {
          return 'DesignToken'
        },
      )
    },
    undo: () => {},
  })

  // Add `variable` key to attributes
  styleDictionary.registerTransform({
    name: 'pinceau/variable',
    type: 'attribute',
    matcher: () => true,
    transformer(token) {
      return {
        variable: `var(--${token.name})`,
      }
    },
  })

  // Replace dashed by dotted
  styleDictionary.registerTransform({
    name: 'pinceau/name',
    type: 'name',
    matcher: () => true,
    transformer(token) {
      return token.name.replaceAll('-', '.')
    },
  })

  // Handle responsive tokens
  styleDictionary.registerTransform({
    name: 'pinceau/responsiveTokens',
    type: 'value',
    transitive: true,
    matcher: (token) => {
      // Handle responsive tokens
      const keys = typeof token.value === 'object' ? Object.keys(token.value) : []
      if (
        keys
        && keys.includes('initial')
        && keys.some(key => mqKeys.includes(key))
      ) {
        return true
      }

      return false
    },
    transformer: (token) => {
      Object.entries(token.value).forEach(
        ([key, value]) => {
          if (key === 'initial') { return }
          if (!responsiveTokens[key]) { responsiveTokens[key] = [] }
          const responsiveToken = { ...token, value }
          if (!(responsiveTokens[key].some(token => token.name === responsiveToken.name))) {
            responsiveTokens[key].push(responsiveToken)
          }
        },
      )
      return token.value.initial
    },
  })

  styleDictionary.registerTransform({
    name: 'pinceau/boxShadows',
    type: 'value',
    transitive: true,
    matcher: (token) => {
      const value = token?.original?.value || token?.value

      if (value) {
        if (Array.isArray(value)) {
          return value.some((value: any) => isShadowToken(value))
        }
        return isShadowToken(value)
      }
    },
    transformer(token) {
      const value = token?.original?.value || token?.value

      let result: string | string[] = ''

      if (value) {
        if (Array.isArray(value)) {
          result = value.map((value: any) => transformShadow(value))
        }
        else {
          result = transformShadow(value)
        }
      }

      return Array.isArray(result) ? result.join(', ') : result
    },
  })

  // Transform group used accross all tokens formats
  styleDictionary.registerTransformGroup({
    name: 'pinceau',
    transforms: ['name/cti/kebab', 'size/px', 'color/hex', 'pinceau/variable', 'pinceau/boxShadows', 'pinceau/responsiveTokens'],
  })

  // types.ts
  styleDictionary.registerFormat({
    name: 'pinceau/types',
    formatter() {
      return tsTypesDeclaration(transformedTokensTyping)
    },
  })

  // index.css
  styleDictionary.registerFormat({
    name: 'pinceau/css',
    formatter({ dictionary, options }) {
      const selector = options.selector ? options.selector : ':root'
      const { outputReferences } = options
      const { formattedVariables } = StyleDictionary.formatHelpers
      let css = `${selector} {\n${formattedVariables({ format: 'css', dictionary, outputReferences })}\n}\n`
      Object.entries(responsiveTokens).forEach(
        ([key, value]) => {
          const formattedResponsiveContent = formattedVariables({ format: 'css', dictionary: { allTokens: value } as any, outputReferences })
          let responsiveSelector
          if (key === 'dark' || key === 'light') {
            if (colorSchemeMode === 'class') {
              responsiveSelector = `:root.${key}`
            }
            else {
              responsiveSelector = `@media (prefers-color-scheme: ${key})`
            }
          }
          else {
            responsiveSelector = dictionary.allTokens.find(token => token.name === `media.${key}`)
          }

          if (responsiveSelector.startsWith('@media')) {
            css += `\n${responsiveSelector} { :root {\n${formattedResponsiveContent}\n}\n}\n`
          }
          else {
            css += `\n${responsiveSelector} {\n${formattedResponsiveContent}\n}\n`
          }
        },
      )
      outputs.css = css
      return css
    },
  })

  // index.json
  styleDictionary.registerFormat({
    name: 'pinceau/json',
    formatter({ dictionary: { allTokens } }) {
      const json = `{\n${allTokens.map((token) => {
        return `  "${token.name}": ${JSON.stringify(token.value)}`
      }).join(',\n')}\n}`
      outputs.json = json
      return json
    },
  })

  // index.ts
  styleDictionary.registerFormat({
    name: 'pinceau/typescript',
    formatter() {
      const ts = tsFull(transformedTokens)
      outputs.ts = ts
      return ts
    },
  })

  // index.js
  styleDictionary.registerFormat({
    name: 'pinceau/javascript',
    formatter() {
      const js = jsFull(transformedTokens)
      outputs.js = js
      return js
    },
  })

  // flat.ts
  styleDictionary.registerFormat({
    name: 'pinceau/typescript-flat',
    formatter() {
      const _tsFlat = tsFlat(transformedTokens)
      outputs.flat_ts = _tsFlat
      return _tsFlat
    },
  })

  // flat.js
  styleDictionary.registerFormat({
    name: 'pinceau/javascript-flat',
    formatter() {
      const _jsFlat = jsFlat(transformedTokens)
      outputs.flat_js = _jsFlat
      return _jsFlat
    },
  })

  styleDictionary = styleDictionary.extend({
    tokens: tokens as any,
    platforms: {
      prepare: {
        silent,
        transformGroup: 'pinceau',
        actions: ['prepare'],
      },

      ts: {
        silent,
        transformGroup: 'pinceau',
        buildPath,
        files: [
          {
            destination: 'index.css',
            format: 'pinceau/css',
          },
          {
            destination: 'types.ts',
            format: 'pinceau/types',
          },
          {
            destination: 'index.ts',
            format: 'pinceau/typescript',
          },
          {
            destination: 'flat.ts',
            format: 'pinceau/typescript-flat',
          },
          {
            destination: 'index.js',
            format: 'pinceau/javascript',
          },
          {
            destination: 'flat.js',
            format: 'pinceau/javascript-flat',
          },
        ],
      },

      done: {
        silent,
        transformGroup: 'pinceau',
        actions: ['done'],
      },
    },
  })

  try {
    result = await new Promise<ThemeGenerationOutput>(
      (resolve) => {
        styleDictionary.registerAction({
          name: 'done',
          do: () => {
            resolve({
              tokens: transformedTokens as PinceauTheme,
              outputs,
              buildPath,
            })
          },
          undo: () => {},
        })
        styleDictionary.buildAllPlatforms()
      },
    )
  }
  catch (e) {
    logger.error('Pinceau could not build your design tokens configuration!')
    if (debug) { logger.error(e) }
  }

  return result
}

/**
 * Walk through tokens definition.
 */
export function walkTokens(
  obj: any,
  cb: (value: any, obj: any) => any,
) {
  let result: { [key: string]: any } = {}

  if (obj.value) {
    result = cb(obj, result)
  }
  else {
    for (const k in obj) {
      if (obj[k] && typeof obj[k] === 'object') { result[k] = walkTokens(obj[k], cb) }
    }
  }

  return result
}
