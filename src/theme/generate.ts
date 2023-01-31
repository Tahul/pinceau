import fsp from 'node:fs/promises'
import fs from 'node:fs'
import type { Core as Instance } from 'style-dictionary-esm'
import StyleDictionary from 'style-dictionary-esm'
import { join } from 'pathe'
import { flattenTokens } from '../utils/theme'
import type { PinceauOptions, ThemeGenerationOutput } from '../types'
import { message } from '../utils/logger'
import { normalizeConfig } from '../utils/data'
import { cssFull, definitionsFull, schemaFull, tsFull, utilsFull } from './formats'

export async function generateTheme(
  tokens: any,
  definitions: any,
  { outputDir: buildPath, colorSchemeMode, studio, definitions: definitionsSupport, utilsImports }: PinceauOptions,
  silent = true,
): Promise<ThemeGenerationOutput> {
  let styleDictionary: Instance = StyleDictionary

  // Files created by Pinceau
  const files = [
    {
      destination: 'theme/index.css',
      // Has to be named `css` to be recognized as CSS output
      format: 'css',
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

  // Support definitions.ts
  if (definitionsSupport) {
    files.push({
      destination: 'definitions.ts',
      format: 'pinceau/definitions',
    })
  }

  // Transforms used
  const transforms = [
    'size/px',
    'color/hex',
    'pinceau/name',
    'pinceau/variable',
    'pinceau/responsiveTokens',
  ]

  // Tokens outputs as in-memory objects
  const outputs: ThemeGenerationOutput['outputs'] = {}

  // Generation result for virtual storage
  let result = {
    tokens: {},
    outputs: {} as Record<string, any>,
    buildPath,
  }

  // Skip generation if no tokens provided
  if (!tokens || typeof tokens !== 'object' || !Object.keys(tokens).length) { return result }

  // Custom properties handling
  const utils = { ...(tokens?.utils || {}) }
  if (tokens?.utils) { delete tokens?.utils }

  // Responsive tokens
  const mqKeys = ['dark', 'light', ...Object.keys(tokens?.media || {})]
  const responsiveTokens = {}

  // Cleanup default fileHeader
  styleDictionary.fileHeader = {}

  // Add `variable` key to attributes
  styleDictionary.registerTransform({
    name: 'pinceau/variable',
    type: 'attribute',
    matcher: () => true,
    transformer(token) {
      return { variable: `var(--${token.name})` }
    },
  })

  // Replace dashed by dotted
  styleDictionary.registerTransform({
    name: 'pinceau/name',
    type: 'name',
    matcher: () => true,
    transformer(token) {
      if (token.path.join('').includes('-')) { message('WRONG_TOKEN_NAMING', [token]) }
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

  // index.css
  styleDictionary.registerFormat({
    name: 'css',
    formatter({ dictionary, options }) {
      const result = cssFull(dictionary, options, responsiveTokens, colorSchemeMode)
      outputs.css = result
      return result
    },
  })

  // utils.ts
  styleDictionary.registerFormat({
    name: 'pinceau/utils',
    formatter() {
      outputs.utils = utilsFull(utils, utilsImports, definitions)
      return outputs.utils
    },
  })

  // definitions.ts
  styleDictionary.registerFormat({
    name: 'pinceau/definitions',
    formatter() {
      outputs.definitions = definitionsFull(definitions)
      return outputs.definitions
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

  // Transform group used accross all tokens formats
  styleDictionary.registerTransformGroup({
    name: 'pinceau',
    transforms,
  })

  styleDictionary = styleDictionary.extend({
    tokens: normalizeConfig(tokens, mqKeys, true),
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
              tokens: flattenTokens(tokens),
              outputs,
              buildPath,
            })
          },
          undo: () => {},
        })
        styleDictionary.buildAllPlatforms()
      },
    )

    // schema.ts ; enabled only when Studio detected
    if (studio) {
      try {
        const schema = await schemaFull(tokens)

        const schemaPath = join(buildPath, 'schema.ts')

        if (fs.existsSync(schemaPath)) { await fsp.unlink(schemaPath) }

        await fsp.writeFile(schemaPath, schema, 'utf-8')

        result.outputs.schema = schema
      }
      catch (e) {
        message('SCHEMA_BUILD_ERROR', [e])
      }
    }
  }
  catch (e) {
    message('CONFIG_BUILD_ERROR', [e])
  }

  return result
}
