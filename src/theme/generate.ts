import StyleDictionary from 'style-dictionary'
import type { Dictionary, Core as Instance } from 'style-dictionary'
import type { DesignTokens, PinceauConfig } from '../types'
import { referencesRegex, resolveVariableFromPath, walkTokens } from '../utils'
import { jsFull, tsFull, tsTypesDeclaration } from './formats'

export async function generateTokens(
  tokens: PinceauConfig,
  buildPath: string,
  silent = false,
) {
  // Get styleDictionary instance
  const styleDictionary = await getStyleDictionaryInstance(tokens, buildPath)

  // Generate outputs silently
  return await generateTokensOutputs(styleDictionary, silent)
}

export async function getStyleDictionaryInstance(tokens: PinceauConfig, buildPath: string) {
  let styleDictionary: Instance = StyleDictionary

  const aliasedTokens: { [key: string]: string } = {}
  let transformedTokens: DesignTokens

  styleDictionary.fileHeader = {}

  // Prepare tokens, and walk them once
  styleDictionary.registerAction({
    name: 'prepare',
    do: (dictionary) => {
      transformedTokens = walkTokens(
        dictionary.tokens,
        (token) => {
          // Resolve aliased properties
          const keyRegex = /{(.*)}/g
          const hasReference = token?.original?.value?.match(referencesRegex) || false
          const reference = token.name
          if (hasReference?.[0] && hasReference[0] === token.original.value) {
            token.value = (token.original.value as string).replace(
              keyRegex,
              (_, tokenPath) => {
                aliasedTokens[reference] = resolveVariableFromPath(tokenPath)
                return aliasedTokens[reference]
              },
            )
          }
          return token
        },
      )
    },
    undo: () => {
      //
    },
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

  styleDictionary.registerTransformGroup({
    name: 'pinceau',
    transforms: ['name/cti/kebab', 'size/px', 'color/hex', 'pinceau/variable'],
  })

  styleDictionary.registerFormat({
    name: 'pinceau/types',
    formatter() {
      return tsTypesDeclaration(tokens)
    },
  })

  styleDictionary.registerFormat({
    name: 'pinceau/css',
    formatter({ dictionary, options }) {
      const selector = options.selector ? options.selector : ':root'
      const { outputReferences } = options
      const { formattedVariables } = StyleDictionary.formatHelpers

      dictionary.allTokens = dictionary.allTokens.filter(token => !aliasedTokens[token.name])

      const css = `${selector} {\n${formattedVariables({ format: 'css', dictionary, outputReferences })}\n}\n`

      return css
    },
  })

  styleDictionary.registerFormat({
    name: 'pinceau/json',
    formatter({ dictionary: { allTokens } }) {
      const json = `{\n${allTokens.map((token) => {
        return `  "${token.name}": ${JSON.stringify(token.value)}`
      }).join(',\n')}\n}`

      return json
    },
  })

  styleDictionary.registerFormat({
    name: 'pinceau/typescript',
    formatter() {
      const ts = tsFull(transformedTokens, aliasedTokens)

      return ts
    },
  })

  styleDictionary.registerFormat({
    name: 'pinceau/javascript',
    formatter() {
      const js = jsFull(transformedTokens, aliasedTokens)

      return js
    },
  })

  styleDictionary = styleDictionary.extend({
    tokens,
    platforms: {
      prepare: {
        transformGroup: 'pinceau',
        actions: ['prepare'],
      },

      ts: {
        transformGroup: 'pinceau',
        buildPath,
        files: [
          {
            destination: 'pinceau.css',
            format: 'pinceau/css',
          },
          {
            destination: 'pinceau.d.ts',
            format: 'pinceau/types',
          },
          {
            destination: 'pinceau.ts',
            format: 'pinceau/typescript',
          },
          {
            destination: 'pinceau.js',
            format: 'pinceau/javascript',
          },
        ],
      },

      done: {
        actions: ['done'],
      },
    },
  })

  return styleDictionary
}

export async function generateTokensOutputs(styleDictionary: Instance, silent = false) {
  return new Promise<Dictionary>(
    (resolve, reject) => {
      try {
        // Weird trick to disable nasty logging
        if (silent) {
        // @ts-expect-error - Silent console.log
        // eslint-disable-next-line no-console
          console._log = console.log
          // eslint-disable-next-line no-console
          console.log = () => {}
        }

        // Actions run at the end of build, helps on awaiting it properly
        styleDictionary.registerAction({
          name: 'done',
          do: (dictionary) => {
            resolve(dictionary)
          },
          undo: () => {
            //
          },
        })

        styleDictionary.cleanAllPlatforms()

        styleDictionary.buildAllPlatforms()

        // Weird trick to disable nasty logging
        if (silent) {
        // @ts-expect-error - Silent console.log
        // eslint-disable-next-line no-console
          console.log = console._log
        }
      }
      catch (e) {
        reject(e)
      }
    },
  )
}
