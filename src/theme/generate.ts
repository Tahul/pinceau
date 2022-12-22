import type { Core as Instance } from 'style-dictionary-esm'
import StyleDictionary from 'style-dictionary-esm'
import type { PinceauOptions, ThemeGenerationOutput } from '../types'
import { message } from '../utils/logger'
import { cssFull, schemaFull, tsFull, utilsFull } from './formats'

export async function generateTheme(tokens: any, { outputDir: buildPath, colorSchemeMode, studio }: PinceauOptions, silent = true): Promise<ThemeGenerationOutput> {
  let styleDictionary: Instance = StyleDictionary

  // Files created by Pinceau
  const files = [
    {
      destination: 'index.css',
      format: 'pinceau/css',
    },
    {
      destination: 'index.ts',
      format: 'pinceau/typescript',
    },
    {
      destination: 'utils.ts',
      format: 'pinceau/utils',
    },
  ]

  // Tokens outputs as in-memory objects
  const outputs: ThemeGenerationOutput['outputs'] = {}

  let result = {
    tokens: {},
    outputs: {} as Record<string, any>,
    buildPath,
  }

  // Skip generation if no tokens provided
  if (!tokens || typeof tokens !== 'object' || !Object.keys(tokens).length) {
    return result
  }

  // Custom properties
  const utils = { ...(tokens?.utils || {}) }
  if (tokens?.utils) { delete tokens?.utils }

  // Responsive tokens
  const mqKeys = ['dark', 'light', Object.keys(tokens?.media || [])]
  const responsiveTokens = {}

  // Cleanup default fileHeader
  styleDictionary.fileHeader = {}

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
      if (token.path.join('').includes('-')) {
        message('WRONG_TOKEN_NAMING', [token])
      }
      return token.path.join('-')
    },
  })

  // Locally resolves responsive tokens from dictionnary
  styleDictionary.registerTransform({
    name: 'pinceau/responsiveTokens',
    type: 'value',
    transitive: true,
    matcher: (token) => {
      // Handle responsive tokens
      const keys = typeof token.value === 'object' ? Object.keys(token.value) : []

      // Mark as responsive token if `initial` is present and at least one other MQ property.
      // It has to be this way, so another object with only `initial` as key won't be marked as a responsive token.
      if (keys && keys.includes('initial') && keys.some(key => mqKeys.includes(key))) { return true }

      return false
    },
    transformer: (token) => {
      // Loop on token `value` keys
      Object.entries(token.value).forEach(
        ([key, value]) => {
          // Skip initial as it'll be casted as token value by this transformer
          if (key === 'initial') { return }

          // Initialize responsive tokens declaration for this query
          if (!responsiveTokens[key]) { responsiveTokens[key] = [] }

          // Recompose a token from responsive value and existing token
          const responsiveToken = { ...token, value }

          // Push token to responsive tokens
          responsiveTokens[key].push(responsiveToken)
        },
      )

      // Cast token to its initial value
      return token.value
    },
  })

  // Transform group used accross all tokens formats
  styleDictionary.registerTransformGroup({
    name: 'pinceau',
    transforms: [
      'size/px',
      'color/hex',
      'pinceau/name',
      'pinceau/variable',
      'pinceau/responsiveTokens',
    ],
  })

  // index.css
  styleDictionary.registerFormat({
    name: 'pinceau/css',
    formatter({ dictionary, options }) {
      outputs.css = cssFull(dictionary, options, responsiveTokens, colorSchemeMode)
      return outputs.css
    },
  })

  // utils.ts
  styleDictionary.registerFormat({
    name: 'pinceau/utils',
    formatter() {
      outputs.utils = utilsFull(utils)
      return outputs.utils
    },
  })

  // index.ts
  styleDictionary.registerFormat({
    name: 'pinceau/typescript',
    formatter({ dictionary }) {
      outputs.ts = tsFull(dictionary.tokens)
      return outputs.ts
    },
  })

  // schema.ts ; enabled only when Studio detected
  if (studio) {
    const schema = await schemaFull(tokens)

    files.push({
      destination: 'schema.ts',
      format: 'pinceau/schema',
    })

    styleDictionary.registerFormat({
      name: 'pinceau/schema',
      formatter() {
        outputs.schema = schema
        return schema
      },
    })
  }

  styleDictionary = styleDictionary.extend({
    tokens: tokens as any,
    platforms: {
      prepare: {
        silent,
        transformGroup: 'pinceau',
      },

      base: {
        silent,
        transformGroup: 'pinceau',
        buildPath,
        files,
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
          do: ({ tokens }) => {
            resolve({
              tokens,
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
    message('CONFIG_BUILD_ERROR', [e])
  }

  return result
}
