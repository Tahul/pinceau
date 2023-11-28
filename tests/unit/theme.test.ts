import fs from 'node:fs'
import { createRequire } from 'node:module'
import type { File } from '@babel/types'
import type { PinceauContext, PinceauOptions } from '@pinceau/core'
import { tokensPaths } from '@pinceau/core/runtime'
import { normalizeOptions, parseAst, parsePinceauQuery, usePinceauContext, usePinceauTransformContext } from '@pinceau/core/utils'
import type { PinceauConfigContext, PinceauThemeFormat, PinceauThemeTokenTransform } from '@pinceau/theme'
import { createThemeRule, normalizeTokens, resolveMediaSelector, resolveReponsiveSelectorPrefix, walkTokens } from '@pinceau/theme/runtime'
import { transformColorScheme, transformMediaQueries, transformThemeHelper } from '@pinceau/theme/transforms'
import {
  cssFormat,
  declarationFormat,
  definitionsFormat,
  generateTheme,
  getConfigLayer,
  helperRegex,
  hmrFormat,
  importConfigFile,
  isDesignTokenLike,
  isResponsiveToken,
  isSafeConstName,
  isTokenNode,
  javascriptFormat,
  loadLayers,
  pinceauNameTransformer,
  pinceauVariableTransformer,
  resolveConfigDefinitions,
  resolveConfigImports,
  resolveConfigPath,
  resolveConfigSources,
  resolveConfigUtils,
  resolveFileLayer,
  resolveInlineLayer,
  resolveMediaQueriesKeys,
  resolveNodePath,
  schemaFormat,
  setupThemeFormats,
  transformIndexHtml,
  typescriptFormat,
  usePinceauConfigContext,
  utilsFormat,
  utilsTypesFormat,
} from '@pinceau/theme/utils'
import { PinceauVueTransformer } from '@pinceau/vue/utils'
import fg from 'fast-glob'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import themeConfig from '../fixtures/theme/theme.config'
import themeConfigContent from '../fixtures/theme/theme.config.ts?raw'
import { findNode, pigmentsLayers, resolveFixtures, resolveTmp, testFileLayer, testLayer } from '../utils'

describe('@pinceau/theme', () => {
  describe('utils/config-context.ts', () => {
    let ctx: PinceauContext
    let configCtx: PinceauConfigContext

    beforeEach(() => {
      ctx = usePinceauContext()
      ctx.fs = fs
      ctx.resolve = createRequire(import.meta.url).resolve
      setupThemeFormats(ctx)
      ctx.options.theme.pigments = false
      configCtx = usePinceauConfigContext(ctx)
      ctx.options.theme.layers = []
      ctx.options.theme.buildDir = undefined
    })

    afterAll(() => {
      vi.clearAllMocks()
    })

    it('create PinceauConfigContext without options', async () => {
      expect(configCtx).toBeDefined()
      expect(configCtx.buildTheme).toBeDefined()
    })
    it('create PinceauConfigContext with options', async () => {
      const localContext = usePinceauContext({
        theme: {
          layers: [
            pigmentsLayers,
          ],
        },
      })

      const localConfigContext = usePinceauConfigContext(localContext)

      await localConfigContext.buildTheme()

      expect(localConfigContext.ready).toBeDefined()
      expect(localConfigContext.config).toBeDefined()
      expect(localConfigContext).toBeDefined()
    })
    it('inject @pinceau/pigments build theme without options', async () => {
      ctx.fs = fs
      ctx.resolve = createRequire(import.meta.url).resolve
      ctx.options.theme.pigments = true

      await configCtx.buildTheme()

      expect(configCtx.ready).toBeDefined()
      expect(configCtx.config).toBeDefined()
      expect(configCtx.config.sources.length).toBe(1)
      expect(Object.keys(configCtx.config.theme).length).toBeGreaterThan(0)
      expect(Object.keys(configCtx.config.theme).length).toBeGreaterThan(0)
      ;['id', 'properties', 'default', 'type'].forEach(prop => expect(configCtx.config.schema).toHaveProperty(prop))
      expect(Object.keys(configCtx.config.theme).length).toBeGreaterThan(0)
    })
    it('can build without theme layer', async () => {
      await configCtx.buildTheme()

      expect(configCtx.ready).toBeDefined()
      expect(configCtx.config).toBeDefined()
      expect(configCtx.config.sources.length).toBe(0)
      expect(configCtx.config.theme).toStrictEqual({})
      expect(configCtx.config.utils).toStrictEqual({})
      ;['id', 'properties', 'default', 'type'].forEach(prop => expect(configCtx.config.schema).toHaveProperty(prop))
      expect(configCtx.config.definitions).toStrictEqual({})
    })
    it('build theme with inline options', async () => {
      ctx.options.theme.layers.push({
        tokens: {
          color: {
            primary: 'red',
          },
        },
      })

      const output = await configCtx.buildTheme()

      expect((output as any).theme.color.primary.value).toBe('red')
      expect(output.buildDir).toBeUndefined()
      expect(output.outputs['@pinceau/outputs/theme.css']).toContain('--color-primary: red;')
    })
    it('does not write without buildDir', async () => {
      vi.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => { })

      ctx.options.theme.layers.push({
        tokens: {
          color: {
            primary: 'red',
          },
        },
      })

      await configCtx.buildTheme()

      expect(fs.writeFileSync).not.toHaveBeenCalled()
    })
    it('outputs theme to buildDir', async () => {
      vi.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => { })

      ctx.options.theme.buildDir = resolveTmp()

      ctx.options.theme.layers.push(testLayer)

      await configCtx.buildTheme()

      expect(fs.writeFileSync).toHaveBeenCalled()
    })
    it('merges multiple layers', async () => {
      ctx.options.theme.layers.push(testLayer)
      ctx.options.theme.layers.push(pigmentsLayers)

      const output = await configCtx.buildTheme()

      expect((output as any).theme.color.primary.value).toBe('red')
      expect((output as any).theme.color.white.value).toBe('#ffffff')
    })
    it('properly outputs utils', async () => {
      ctx.options.theme.layers.push(pigmentsLayers)
      ctx.options.theme.layers.push({
        utils: {
          testMx: (value: string) => ({
            marginLeft: value,
            marginRight: value,
          }),
        },
      })

      const output = await configCtx.buildTheme()

      expect(output.outputs['@pinceau/outputs/utils']).include('export const testMx')
      expect(output.outputs['@pinceau/outputs/utils']).include('export const mx')
      expect(output.outputs['@pinceau/outputs/utils']).include('export const my')
    })
  })

  describe('utils/config-definitions.ts', () => {
    let configAst: File
    let mqKeys: string[]

    beforeAll(() => {
      configAst = parseAst(themeConfigContent)
      mqKeys = resolveMediaQueriesKeys(themeConfig)
    })

    it('resolve a definitions from a config file AST', () => {
      const definitions = resolveConfigDefinitions(configAst, mqKeys, resolveFixtures('./theme/theme.config.ts'))

      const configPaths = tokensPaths(themeConfig, mqKeys).map(path => path[0]).filter(p => !p.startsWith('utils'))

      const definitionsKeys = Object.keys(definitions)

      configPaths.forEach(path => expect(definitionsKeys).includes(path))
    })

    it('isResponsiveToken() - should identify a node as a responsive token', () => {
      const node = findNode(configAst, (path) => {
        return path.value.key.name === 'responsiveColor'
      })

      expect(isResponsiveToken(node, mqKeys)).toBe(true)
    })

    it('isResponsiveToken() - should not identify a regular node as a responsive token', () => {
      const node = findNode(configAst, (path) => {
        return path.value.key.name === 'white'
      })

      expect(isResponsiveToken(node, mqKeys)).toBeUndefined()
    })

    it('isDesignTokenLike() - should identify a node as token-like', () => {
      const node = findNode(configAst, (path) => {
        return path.value.key.name === 'white'
      })

      expect(isDesignTokenLike(node)).toBe(true)
    })

    it('isDesignTokenLike() - should not identify a node as a token-like', () => {
      const node = findNode(configAst, (path) => {
        return path.value.key.name === 'black'
      })

      expect(isDesignTokenLike(node)).toBeUndefined()
    })

    it('isTokenNode() - should identify token node', () => {
      const node = findNode(configAst, (path) => {
        return path.value.key.name === 'white'
      })

      const tokenNode = isTokenNode(node, mqKeys)

      expect(tokenNode).toBeDefined()
    })

    it('isTokenNode() - should not identify group node as token node', () => {
      const node = findNode(configAst, (path) => {
        return path.value.key.name === 'color'
      })

      const tokenNode = isTokenNode(node, mqKeys)

      expect(tokenNode).toBeUndefined()
    })

    it('isTokenNode() - should identify all types of tokens', () => {
      const black = findNode(configAst, (path) => {
        return path.value.key.name === 'black'
      })
      const white = findNode(configAst, (path) => {
        return path.value.key.name === 'black'
      })
      const responsiveColor = findNode(configAst, (path) => {
        return path.value.key.name === 'responsiveColor'
      })

      const tokenNodes = [black, white, responsiveColor].map(node => isTokenNode(node, mqKeys))

      tokenNodes.forEach(node => expect(node?.value.type).toBeDefined())
    })

    it('resolveNodePath() - should resolve the property key path for a node', () => {
      const node = findNode(configAst, (path) => {
        return path.value.key.name === 'white'
      })

      const keyPath = resolveNodePath(node)

      expect(keyPath).toEqual('color.white')
    })
  })

  describe('utils/config-file.ts', () => {
    let options: PinceauOptions

    beforeEach(() => {
      options = normalizeOptions()
    })

    it('resolveFileLayer() - resolve a file layer', async () => {
      options.theme.layers.push(testFileLayer)

      const layer = await resolveFileLayer(testFileLayer, options)

      expect(layer.path).toBe(resolveFixtures('./theme/theme.config.ts'))
      expect(layer.content).toContain('white')
      expect(layer.content).toContain('black')
      expect(layer.content).toContain('responsiveColor')
      expect(layer.content).toContain('responsiveFullColor')
      expect(layer.imports.length).toBe(0)
    })
    it('importConfigFile() - import a configuration file and its content', async () => {
      const file = await importConfigFile(resolveFixtures('./theme/theme.config.ts'), '.ts')

      expect(Object.keys(file.config).length).toBe(Object.keys(themeConfig).length)
      expect(file.content).toContain('white')
      expect(file.content).toContain('black')
      expect(file.content).toContain('responsiveColor')
      expect(file.content).toContain('responsiveFullColor')
    })
    it('resolveConfigPath() - get a full configuration path from a layer', () => {
      const result = resolveConfigPath(
        {
          path: resolveFixtures('./theme'),
          configFileName: 'theme.config',
        },
        options,
      )

      expect(result?.path).toBe(resolveFixtures('./theme/theme.config.ts'))
    })
  })

  describe('utils/config-imports.ts', () => {
    let configAst: File

    beforeAll(() => {
      configAst = parseAst(themeConfigContent)
    })

    it('resolve imports from a config file AST', async () => {
      const count = themeConfigContent.match(/import\s.*?from\s['"](.*?)['"]/gm)

      const imports = resolveConfigImports(configAst)

      expect(imports.length).toBe((count || []).length - 2)
    })
  })

  describe('utils/config-layers.ts', () => {
    let ctx: PinceauContext

    beforeEach(() => {
      ctx = usePinceauContext()
      ctx.fs = fs
      ctx.resolve = createRequire(import.meta.url).resolve
      setupThemeFormats(ctx)
      ctx.options.theme.pigments = false
      ctx.options.theme.layers = []
      ctx.options.theme.buildDir = undefined
    })

    it('getConfigLayer() - get an empty ConfigLayer', () => {
      const layer = getConfigLayer(resolveFixtures())

      ;[
        'path',
        'ext',
        'content',
        'theme',
        'definitions',
        'utils',
        'imports',
      ].forEach(prop => expect(layer).toHaveProperty(prop))
    })
    it('resolveConfigSources() - resolve pkg source', () => {
      const options = normalizeOptions()

      options.theme.layers = ['@pinceau/pigments']

      const result = resolveConfigSources(options, ctx)

      expect(result.length).toBe(1)

      expect(result[0].path).toBeDefined()
      expect(result[0].configFileName).toBeDefined()
    })
    it('resolveConfigSources() - resolve sources from an user config layers key', () => {
      const options = normalizeOptions()

      options.theme.pigments = false

      options.theme.layers = [
        resolveFixtures('../../packages/pigments'),
        {
          path: resolveFixtures(),
          configFileName: 'theme.config',
        },
        {
          tokens: {
            media: {
              lg: '(min-width: 1024px)',
            },
          },
        },
      ]

      const result = resolveConfigSources(options, ctx)

      expect(result.length).toBe(3)

      expect(result[0].tokens).toBeDefined()
      expect(result[1].path).toBe(resolveFixtures())
      expect(result[2].path).toBe(resolveFixtures('../../packages/pigments'))
    })
    it('resolveMediaQueriesKeys() - it can resolve media queries keys from a config', () => {
      const keys = resolveMediaQueriesKeys(themeConfig)

      expect(keys).toStrictEqual(['$dark', '$light', '$initial', ...Object.keys(themeConfig.media as any).map(key => `$${key}`)])
    })
    it('resolveMediaQueriesKeys() - it can resolve media queries keys multiple configs', () => {
      const keys = resolveMediaQueriesKeys([themeConfig, { media: { test: '(prefers-reduced-motion)' } }])

      expect(keys).toStrictEqual(['$dark', '$light', '$initial', ...Object.keys(themeConfig.media as any).map(key => `$${key}`), '$test'])
    })
    it('resolveMediaQueriesKeys() - it avoid duplicates from multiple configs', () => {
      const keys = resolveMediaQueriesKeys([themeConfig, { media: { sm: '(prefers-reduced-motion)' } }])

      expect(keys).toStrictEqual(['$dark', '$light', '$initial', ...Object.keys(themeConfig.media as any).map(key => `$${key}`)])
    })
    it('resolveInlineLayer() - cast an inline layer to a resolved config layer', () => {
      const options = normalizeOptions()

      const layer = {
        tokens: {
          media: {
            xs: '(min-width: 475px)',
            sm: '(min-width: 640px)',
          },
        },
        utils: {
          my: (value) => {
            return {
              marginTop: value,
              marginBottom: value,
            }
          },
        },
      }

      const result = resolveInlineLayer(layer, options)

      expect(result.utils.my.js).toStrictEqual('(value) => {\n'
      + '            return {\n'
      + '              marginTop: value,\n'
      + '              marginBottom: value\n'
      + '            };\n'
      + '          }')

      expect(Object.keys(result.theme.media as any).length).toBe(2)
    })
    it('loadLayers() - output full output from options layers', async () => {
      const options = normalizeOptions()

      options.theme.pigments = false

      options.theme.layers = [
        resolveFixtures('../../packages/pigments'),
        {
          path: resolveFixtures('./theme'),
          configFileName: 'theme.config',
        },
        {
          tokens: {
            inline: {
              test: 'red',
            },
            media: {
              lg: '(min-width: 1024px)',
            },
          },
        },
      ]

      const output = await loadLayers(options, ctx)

      expect(output.sources.length).toBe(2)
      expect((output.theme as any).inline).toBeDefined()
      expect(output.utils.fixture).toBeDefined()
    })
  })

  describe('utils/config-utils.ts', () => {
    let configAst: File

    beforeAll(() => {
      configAst = parseAst(themeConfigContent)
    })

    it('resolve utils from a config file AST', async () => {
      const utils = resolveConfigUtils(configAst, themeConfig)

      expect(Object.keys(utils).length).toBe(Object.keys((themeConfig as any).utils).length)
    })
  })

  describe('utils/css-rules.ts', () => {
    it('resolveMediaSelector() - returns a class based selector for color schemes when mode is "class"', () => {
      const result = resolveMediaSelector({
        mq: '$dark',
        colorSchemeMode: 'class',
        theme: {},
      })
      expect(result).toBe(':root.dark')
    })

    it('resolveMediaSelector() - returns a preference based selector for color schemes when mode is not "class"', () => {
      const result = resolveMediaSelector({
        mq: '$light',
        colorSchemeMode: 'media',
        theme: {},
      })
      expect(result).toBe('(prefers-color-scheme: light)')
    })

    it('resolveMediaSelector() - returns media query value for non-initial media query', () => {
      const theme = {
        media: {
          'some-other-query': { value: '(min-width: 600px)' },
        },
      }
      const result = resolveMediaSelector({
        mq: 'some-other-query',
        colorSchemeMode: 'media',
        theme,
      })
      expect(result).toBe('(min-width: 600px)')
    })

    it('resolveMediaSelector() - returns an empty string for the "initial" media query', () => {
      const result = resolveMediaSelector({
        mq: '$initial',
        colorSchemeMode: 'class',
        theme: {},
      })
      expect(result).toBe('')
    })

    it('resolveReponsiveSelectorPrefix() - returns a default prefix for an empty selector', () => {
      const result = resolveReponsiveSelectorPrefix('')
      expect(result).toBe('@media {\n  :root {')
    })

    it('resolveReponsiveSelectorPrefix() - returns a class based prefix for a class selector', () => {
      const result = resolveReponsiveSelectorPrefix('.dark')
      expect(result).toBe('@media {\n  :root.dark {')
    })

    it('resolveReponsiveSelectorPrefix() - returns a root prefix for a root selector', () => {
      const result = resolveReponsiveSelectorPrefix(':root.dark')
      expect(result).toBe('@media {\n  :root.dark {')
    })

    it('resolveReponsiveSelectorPrefix() - returns a general prefix for other selectors', () => {
      const result = resolveReponsiveSelectorPrefix('(prefers-color-scheme: dark)')
      expect(result).toBe('@media (prefers-color-scheme: dark) {\n  :root {')
    })

    it('createThemeRule() - returns a properly formatted theme rule', () => {
      const themeRule = createThemeRule({
        content: '    background-color: red;',
        mq: '$dark',
        colorSchemeMode: 'class',
        theme: {},
        indentation: '  ',
      })
      expect(themeRule).toBe('\n@media {\n  :root.dark {\n    --pinceau-mq: $dark;\n    background-color: red;\n  }\n}\n')
    })
  })

  describe('utils/generate.ts', () => {
    let ctx: PinceauContext

    beforeEach(() => {
      ctx = usePinceauContext()
      setupThemeFormats(ctx)
      ctx.options.theme.layers = []
      ctx.options.theme.buildDir = undefined
    })

    it('generate theme output', async () => {
      ctx.options.theme.layers = [testFileLayer]

      const output = await loadLayers(ctx.options, ctx)

      const themeOutput = await generateTheme(output, ctx)

      expect(themeOutput.buildDir).toBeUndefined()
      expect(themeOutput.outputs).toHaveProperty('@pinceau/outputs/theme.css')
      expect(themeOutput.outputs).toHaveProperty('@pinceau/outputs/theme')
      expect(themeOutput.outputs).toHaveProperty('@pinceau/outputs/utils')
      expect(themeOutput.outputs).toHaveProperty('@pinceau/outputs/definitions')
      expect(themeOutput.outputs).toHaveProperty('@pinceau/outputs/schema')
    })

    it('generate theme output (write)', async () => {
      ctx.options.theme.layers = [testFileLayer]

      ctx.options.theme.buildDir = resolveTmp('./generate-output/')

      const output = await loadLayers(ctx.options, ctx)

      const themeOutput = await generateTheme(output, ctx)

      const files = (await fg(`${ctx.options.theme.buildDir}/**/*`))
      const fileNames = files.map(file => file.split('/').pop())

      expect(themeOutput.buildDir).toBeDefined()
      expect(themeOutput.outputs).toHaveProperty('@pinceau/outputs/theme.css')
      expect(fileNames).toContain('theme.css')
      expect(themeOutput.outputs).toHaveProperty('@pinceau/outputs/theme')
      expect(themeOutput.outputs).toHaveProperty('@pinceau/outputs/theme-ts')
      expect(themeOutput.outputs).toHaveProperty('@pinceau/outputs')
      expect(fileNames).toContain('theme.ts')
      expect(fileNames).toContain('theme.js')
      expect(themeOutput.outputs).toHaveProperty('@pinceau/outputs/utils')
      expect(themeOutput.outputs).toHaveProperty('@pinceau/outputs/utils-ts')
      expect(fileNames).toContain('utils.ts')
      expect(fileNames).toContain('utils.js')
      expect(themeOutput.outputs).toHaveProperty('@pinceau/outputs/definitions')
      expect(fileNames).toContain('definitions.js')
      expect(themeOutput.outputs).toHaveProperty('@pinceau/outputs/schema')
      expect(fileNames).toContain('schema.js')

      files.forEach((path) => {
        try {
          fs.rmSync(path)
          fs.rmdirSync(resolveTmp('./generate-output/'))
        }
        catch (_) {
          //
        }
      })
    })
  })

  describe('utils/html.ts', () => {
    let ctx: PinceauContext
    let resolveModule: ReturnType<typeof vi.fn>

    beforeEach(() => {
      ctx = usePinceauContext({
        dev: false,
        theme: {
          preflight: false,
        },
        runtime: false,
      })

      ctx.getOutputId = vi.fn().mockReturnValue('mockedOutputId')
      ctx.getOutput = vi.fn().mockReturnValue('mockedOutputContent')
      resolveModule = vi.fn()
    })

    it('adds theme sheet in place of <pinceau />', async () => {
      const inputHtml = '<pinceau />'
      const expectedHtml = '<style type="text/css" id="pinceau-theme">mockedOutputContent</style>'

      const result = await transformIndexHtml(inputHtml, ctx as any)
      expect(result).toBe(expectedHtml)
    })

    it('enforce inject the pinceau tags to <head> when <pinceau /> is missing', async () => {
      ctx.options.theme.enforceHtmlInject = true

      const inputHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/main.ts"></script>
  </body>
</html>
`
      const expectedHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0"><style type="text/css" id="pinceau-theme">mockedOutputContent</style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/main.ts"></script>
  </body>
</html>
`

      const result = await transformIndexHtml(inputHtml, ctx as any)
      expect(result).toBe(expectedHtml)
    })

    it('enforce inject the pinceau tags when <pinceau /> is missing and no <head> is present', async () => {
      ctx.options.theme.enforceHtmlInject = true

      const inputHtml = ''
      const expectedHtml = '<style type="text/css" id="pinceau-theme">mockedOutputContent</style>'

      const result = await transformIndexHtml(inputHtml, ctx as any)
      expect(result).toBe(expectedHtml)
    })

    it('do not inject anything if <pinceau /> is not found and enforceHtmlInject is false', async () => {
      ctx.options.theme.enforceHtmlInject = false

      const inputHtml = ''
      const expectedHtml = ''

      const result = await transformIndexHtml(inputHtml, ctx as any)
      expect(result).toBe(expectedHtml)
    })

    it('includes HMR script when in dev mode', async () => {
      ctx.options.dev = true

      const inputHtml = '<pinceau />'
      const expectedHtml = '<style type="text/css" id="pinceau-theme" data-vite-dev-id="mockedOutputId">mockedOutputContent</style>\n<script type="module" data-vite-dev-id="@pinceau/outputs/hmr" src="/__pinceau_hmr.js"></script>'

      const result = await transformIndexHtml(inputHtml, ctx as any)

      expect(result).toBe(expectedHtml)
    })

    it('includes preflight CSS when preflight option is set', async () => {
      ctx.options.theme.preflight = 'tailwind'
      ctx.resolve = resolveModule as any
      resolveModule.mockReturnValueOnce('@unocss/reset/tailwind.css')

      const inputHtml = '<pinceau />'
      const expectedHtml = '<link rel="stylesheet" type="text/css" href="@unocss/reset/tailwind.css" />\n<style type="text/css" id="pinceau-theme">mockedOutputContent</style>'

      const result = await transformIndexHtml(inputHtml, ctx as any)

      expect(result).toBe(expectedHtml)
    })
  })

  describe('utils/helper-regex.ts', () => {
    it('matches helper function with one argument and single quotes', () => {
      const regex = helperRegex('$theme')
      const matches = regex.exec('$theme(\'my.color.token\')')

      expect(matches).not.toBeNull()
      expect(matches?.[1]).toBe('my.color.token')
    })

    it('matches helper function with two arguments and single quotes', () => {
      const regex = helperRegex('$theme')
      const matches = regex.exec('$theme(\'my.color.token\', \'key\')')

      expect(matches).not.toBeNull()
      expect(matches?.[1]).toBe('my.color.token')
      expect(matches?.[3]).toBe('key')
    })

    it('matches helper function with one argument and double quotes', () => {
      const regex = helperRegex('$theme')
      const matches = regex.exec('$theme("my.color.token")')

      expect(matches).not.toBeNull()
      expect(matches?.[1]).toBe('my.color.token')
    })

    it('matches helper function with one argument and backticks', () => {
      const regex = helperRegex('$theme')
      const matches = regex.exec('$theme(`my.color.token`)')

      expect(matches).not.toBeNull()
      expect(matches?.[1]).toBe('my.color.token')
    })

    it('matches helper function with two mixed argument quotes', () => {
      const regex = helperRegex('$theme')
      const matches = regex.exec('$theme("my.color.token", \'key\')')

      expect(matches).not.toBeNull()
      expect(matches?.[1]).toBe('my.color.token')
      expect(matches?.[3]).toBe('key')
    })

    it('does not match an incorrect helper function name', () => {
      const regex = helperRegex('$theme')
      const matches = regex.exec('$incorrect(\'my.color.token\', \'key\')')

      expect(matches).toBeNull()
    })

    it('matches multiple occurrences of the helper function', () => {
      const regex = helperRegex('$theme')
      const str = 'Use $theme("my.color.token1"). Also use $theme(\'my.color.token2\', \'key2\')'
      const matches = Array.from(str.matchAll(regex))

      expect(matches).toHaveLength(2)
      expect(matches?.[0][1]).toBe('my.color.token1')
      expect(matches?.[1][1]).toBe('my.color.token2')
      expect(matches?.[1][3]).toBe('key2')
    })
  })

  describe('utils/safe-const.ts', () => {
    it('returns true for valid constant names', () => {
      const names = ['validName', 'VALID_NAME', '_validName', '$validName', 'name2']

      for (const name of names) { expect(isSafeConstName(name)).toBe(true) }
    })

    it('returns false for invalid starting characters', () => {
      const names = ['9invalid', '!invalid', '-invalid']

      for (const name of names) { expect(isSafeConstName(name)).toBe(false) }
    })

    it('returns false for names that are reserved words', () => {
      const names = ['break', 'class', 'return', 'var', 'true']

      for (const name of names) { expect(isSafeConstName(name)).toBe(false) }
    })

    it('returns true for names that resemble reserved words but have different cases', () => {
      const names = ['Break', 'Class', 'Return', 'Var', 'True']

      for (const name of names) { expect(isSafeConstName(name)).toBe(true) }
    })

    it('returns false for empty string', () => {
      expect(isSafeConstName('')).toBe(false)
    })
  })

  describe('utils/tokens.ts', () => {
    let tokens
    let mqKeys: string[]

    beforeEach(() => {
      mqKeys = resolveMediaQueriesKeys(themeConfig)
      tokens = normalizeTokens(themeConfig, mqKeys)
    })

    it('calls the callback on each design token', () => {
      let callbackCalls = 0
      const callback = () => {
        callbackCalls += 1
        return {}
      }

      walkTokens(tokens, callback)

      expect(callbackCalls).toBe(8) // There are 8 design tokens with value in the sample data
    })

    it('provides accurate paths to the callback', () => {
      const observedPaths: string[][] = []

      const callback = (_, __, paths) => {
        if (!observedPaths.includes(paths)) { observedPaths.push(paths) }
        return {}
      }

      walkTokens(tokens, callback)

      expect(observedPaths).toEqual([
        ['media', 'xs'],
        ['media', 'sm'],
        ['media', 'md'],
        ['media', 'lg'],
        ['color', 'white'],
        ['color', 'black'],
        ['color', 'responsiveColor'],
        ['color', 'responsiveFullColor'],
      ])
    })

    it('transforms the result based on callback logic', () => {
      const callback = (obj) => {
        if (typeof obj.value === 'object') {
          return {
            value: Object.entries(obj.value).reduce(
              (acc, [key, value]) => {
                acc[key] = `${value}-transformed`
                return acc
              },
              {},
            ),
          }
        }

        return { value: `${obj.value}-transformed` }
      }

      const transformedContent = walkTokens(tokens, callback)

      // Non-responsive token
      expect(transformedContent.color.white.value).toBe('#ffffff-transformed')

      // Responsive token
      expect(transformedContent.color.responsiveColor.value.$initial).toBe('blue-transformed')
    })

    describe('utils/tokens-transformers.ts', () => {
      it('pinceauVariableTransformer - add variable attribute', () => {
        const result = pinceauVariableTransformer.transformer({ name: 'color-primary-100' } as any, {})

        expect(result).toStrictEqual({ variable: 'var(--color-primary-100)' })
      })

      it('pinceauNameTransformer - transform name', () => {
        const result = pinceauNameTransformer.transformer({ path: ['color', 'primary', '100'] } as any, {})

        expect(result).toBe('color-primary-100')
      })
    })

    describe('utils/setup.ts', () => {
      // Sample format and transform for testing
      const sampleFormat: PinceauThemeFormat = {
        destination: 'sampleDestination',
        importPath: 'sampleImportPath',
        virtualPath: 'sampleVirtualPath',
        formatter: vi.fn(),
      } as any

      const sampleTransform: PinceauThemeTokenTransform = {
        name: 'sampleTransform',
        transformer: vi.fn(),
      } as any

      it('registers new formats and transforms', () => {
        const ctx = usePinceauContext({
          theme: {
            outputFormats: [sampleFormat],
            tokensTransforms: [sampleTransform],
          },
        })

        setupThemeFormats(ctx)

        expect(ctx.options.theme.outputFormats).toContain(sampleFormat)
        expect(ctx.options.theme.tokensTransforms).toContain(sampleTransform)
      })
      it('does not duplicate existing formats and transforms', () => {
        const ctx = usePinceauContext({
          theme: {
            outputFormats: [sampleFormat],
            tokensTransforms: [sampleTransform],
          },
        })

        setupThemeFormats(ctx)

        const formatOccurrences = ctx.options.theme.outputFormats.filter(format => format.destination === 'sampleDestination').length
        const transformOccurrences = ctx.options.theme.tokensTransforms.filter(transform => transform.name === 'sampleTransform').length

        expect(formatOccurrences).toBe(1)
        expect(transformOccurrences).toBe(1)
      })
    })
  })

  describe('formats/', () => {
    let pinceauContext: PinceauContext
    let configCtx: PinceauConfigContext

    beforeEach(() => {
      pinceauContext = usePinceauContext({
        dev: false,
        theme: {
          layers: [testLayer],
          pigments: false,
        },
      })
      configCtx = usePinceauConfigContext(pinceauContext)
      pinceauContext.options.theme.outputFormats = []
    })

    describe('@pinceau/outputs/theme.css', () => {
      beforeEach(() => {
        pinceauContext.options.theme.outputFormats.push(cssFormat)
      })

      it('build format', async () => {
        const output = await configCtx.buildTheme()

        expect(output).toMatchSnapshot()
      })
    })

    describe('@pinceau/outputs/definitions', () => {
      beforeEach(() => {
        pinceauContext.options.theme.outputFormats.push(definitionsFormat)
      })

      it('build format', async () => {
        const output = await configCtx.buildTheme()

        expect(output).toMatchSnapshot()
      })
    })

    describe('@pinceau/outputs/hmr', () => {
      beforeEach(() => {
        pinceauContext.options.theme.outputFormats.push(hmrFormat)
      })

      it('build format', async () => {
        const output = await configCtx.buildTheme()

        expect(output).toMatchSnapshot()
      })
    })

    describe('@pinceau/outputs/schema', () => {
      beforeEach(() => {
        pinceauContext.options.theme.outputFormats.push(schemaFormat)
      })

      it('build format', async () => {
        const output = await configCtx.buildTheme()

        expect(output).toMatchSnapshot()
      })
    })

    describe('@pinceau/outputs/theme', () => {
      it('build format (js)', async () => {
        pinceauContext.options.theme.outputFormats.push(javascriptFormat)

        const output = await configCtx.buildTheme()

        expect(output).toMatchSnapshot()
      })

      it('build format (ts)', async () => {
        pinceauContext.options.theme.outputFormats.push(typescriptFormat)

        const output = await configCtx.buildTheme()

        expect(output).toMatchSnapshot()
      })
    })

    describe('@pinceau/outputs/declarations', () => {
      beforeEach(() => {
        pinceauContext.options.theme.outputFormats.push(declarationFormat)
      })

      it('build format', async () => {
        const output = await configCtx.buildTheme()

        expect(output).toMatchSnapshot()
      })
    })

    describe('@pinceau/outputs/utils', () => {
      it('build format', async () => {
        pinceauContext.options.theme.outputFormats.push(utilsFormat)

        const output = await configCtx.buildTheme()

        expect(output).toMatchSnapshot()
      })

      it('build format (ts)', async () => {
        pinceauContext.options.theme.outputFormats.push(utilsTypesFormat)

        const output = await configCtx.buildTheme()

        expect(output).toMatchSnapshot()
      })
    })
  })

  describe('transforms/', () => {
    const typescriptQuery = parsePinceauQuery(resolveFixtures('./components/theme-helper.ts'))
    const vueQuery = parsePinceauQuery(resolveFixtures('./components/TestBase.vue'))
    const styleQuery = parsePinceauQuery(resolveFixtures('./style.css'))
    let pinceauContext: PinceauContext
    let configCtx: PinceauConfigContext

    beforeEach(async () => {
      pinceauContext = usePinceauContext({
        theme: {
          layers: [testFileLayer],
        },
      })
      pinceauContext.registerTransformer(
        'vue',
        PinceauVueTransformer,
      )
      setupThemeFormats(pinceauContext)
      configCtx = usePinceauConfigContext(pinceauContext)
      await configCtx.buildTheme()
    })

    it('transformColorScheme() - can transform @dark', async () => {
      const transformContext = usePinceauTransformContext(
        '@dark { h1 { color: red; } }',
        styleQuery,
        pinceauContext,
      )

      transformContext.registerTransforms({
        styles: [transformColorScheme],
      })

      await transformContext.transform()

      expect((transformContext.result() as any).code).toEqual('@media (prefers-color-scheme: dark) { h1 { color: red; } }')
    })
    it('transformColorScheme() - can transform @light', async () => {
      const transformContext = usePinceauTransformContext(
        '@light { h1 { color: red; } }',
        styleQuery,
        pinceauContext,
      )

      transformContext.registerTransforms({
        styles: [transformColorScheme],
      })

      await transformContext.transform()

      expect((transformContext.result() as any).code).toEqual('@media (prefers-color-scheme: light) { h1 { color: red; } }')
    })
    it('transformColorScheme() - can transform both @light and @dark', async () => {
      const transformContext = usePinceauTransformContext(
        '@light { h1 { color: red; } } @dark { h2 { color: red; } }',
        styleQuery,
        pinceauContext,
      )

      transformContext.registerTransforms({
        styles: [transformColorScheme],
      })

      await transformContext.transform()

      expect((transformContext.result() as any).code).toEqual('@media (prefers-color-scheme: light) { h1 { color: red; } } @media (prefers-color-scheme: dark) { h2 { color: red; } }')
    })

    it('transformColorScheme() - can transform both @light and @dark to class mode', async () => {
      pinceauContext.options.theme.colorSchemeMode = 'class'

      const transformContext = usePinceauTransformContext(
        '@light { h1 { color: red; } } @dark { h2 { color: red; } }',
        styleQuery,
        pinceauContext,
      )

      transformContext.registerTransforms({
        styles: [transformColorScheme],
      })

      await transformContext.transform()

      expect((transformContext.result() as any).code).toEqual(':root.light { h1 { color: red; } } :root.dark { h2 { color: red; } }')
    })
    it('transformColorScheme() - do not transform native syntaxes', async () => {
      const transformContext = usePinceauTransformContext(
        nativeCssQueries(),
        styleQuery,
        pinceauContext,
      )

      transformContext.registerTransforms({
        styles: [transformColorScheme],
      })

      await transformContext.transform()

      expect(transformContext.result()).toBeUndefined()
    })
    it('transformMediaQueries() - can transform theme media queries', async () => {
      const transformContext = usePinceauTransformContext(
        '@md { h1 { color: red; } } @lg { h2 { color: red; } }',
        styleQuery,
        pinceauContext,
      )

      transformContext.registerTransforms({
        styles: [transformMediaQueries],
      })

      await transformContext.transform()

      expect((transformContext.result() as any).code).toEqual('@media (min-width: 768px) { h1 { color: red; } } @media (min-width: 1024px) { h2 { color: red; } }')
    })
    it('transformMediaQueries() - do not transform native syntaxes', async () => {
      const transformContext = usePinceauTransformContext(
        nativeCssQueries(),
        styleQuery,
        pinceauContext,
      )

      transformContext.registerTransforms({
        styles: [transformMediaQueries],
      })

      await transformContext.transform()

      expect(transformContext.result()).toBeUndefined()
    })
    it('transformThemeHelper() - can transform token helper in style files', async () => {
      const transformContext = usePinceauTransformContext(
        'div { background-color: $theme(\'color.white\'); }',
        styleQuery,
        pinceauContext,
      )

      transformContext.registerTransforms({
        styles: [transformThemeHelper],
      })

      await transformContext.transform()

      expect((transformContext.result() as any).code).toStrictEqual('div { background-color: var(--color-white); }')
    })
    it('transformThemeHelper() - can transform token helper in typescript files', async () => {
      const transformContext = usePinceauTransformContext(
        'const test = $theme(\'color.white\')',
        typescriptQuery,
        pinceauContext,
      )

      transformContext.registerTransforms({
        scripts: [
          (transformContext, pinceauContext) => {
            // Wrapper has to be added per-scope, so we can ensure we don't break native syntaxes.
            // Default wrapper is empty string, style contexts do not have to provide any wrapper.
            transformThemeHelper(transformContext, pinceauContext, '`')
          },
        ],
      })

      await transformContext.transform()

      expect((transformContext.result() as any).code).toStrictEqual('const test = `var(--color-white)`')
    })
    it('transformThemeHelper() - can transform token helper in vue files', async () => {
      const transformContext = usePinceauTransformContext(
        '<template><div :style="{ color: $theme(\'color.white\') }">Hello World</div></template>\n'
        + '<style>div { background-color: $theme(\'color.black\'); }</style>\n'
        + '<script setup>const test = $theme(\'color.white\')</script>\n',
        vueQuery,
        pinceauContext,
      )

      transformContext.registerTransforms({
        scripts: [
          (transformContext, pinceauContext) => {
            transformThemeHelper(transformContext, pinceauContext, '`')
          },
        ],
        templates: [
          (transformContext, pinceauContext) => {
            transformThemeHelper(transformContext, pinceauContext, '`')
          },
        ],
        styles: [transformThemeHelper],
      })

      await transformContext.transform()

      expect((transformContext.result() as any).code).toStrictEqual(
        '<template><div :style="{ color: `var(--color-white)` }">Hello World</div></template>\n'
        + '<style>div { background-color: var(--color-black); }</style>\n'
        + '<script setup>const test = `var(--color-white)`</script>\n',
      )
    })
    it('transformThemeHelper() - log on unknown token but transform anyway', async () => {
      vi.spyOn(console, 'log').mockImplementationOnce(() => { })

      const transformContext = usePinceauTransformContext(
        'div { background-color: $theme(\'color.primary.100\'); }',
        styleQuery,
        pinceauContext,
      )

      transformContext.registerTransforms({
        styles: [transformThemeHelper],
      })

      await transformContext.transform()

      expect((transformContext.result() as any).code).toStrictEqual('div { background-color: var(--color-primary-100); }')

      expect(console.log).toHaveBeenCalledOnce()
    })
  })
})

function nativeCssQueries() {
  return `
@charset "utf-8";
@color-profile --swop5c {
  src: url("https://example.org/SWOP2006_Coated5v2.icc");
}
@container (width > 400px) {
  h2 {
    font-size: 1.5em;
  }
}
@counter-style thumbs {
  system: cyclic;
  symbols: \"\\1F44D\";
  suffix: " ";
}
@document url("https://www.example.com/")
{
  h1 {
    color: green;
  }
}
@font-face {
  font-family: "Trickster";
  src:
    local("Trickster"),
    url("trickster-COLRv1.otf") format("opentype") tech(color-COLRv1),
    url("trickster-outline.otf") format("opentype"),
    url("trickster-outline.woff") format("woff");
}
@font-feature-values Font One {
  @styleset {
    nice-style: 12;
  }
}
@font-feature-values Font Two {
  @styleset {
    nice-style: 4;
  }
}
@font-palette-values --identifier {
  font-family: Bixa;
}
.my-class {
  font-palette: --identifier;
}
@import url;
@import url layer;
@import url layer(layer-name);
@import url layer(layer-name) supports(supports-condition);
@import url layer(layer-name) supports(supports-condition) list-of-media-queries;
@import url layer(layer-name) list-of-media-queries;
@import url supports(supports-condition);
@import url supports(supports-condition) list-of-media-queries;
@import url list-of-media-queries;
@keyframes slidein {
  from {
    transform: translateX(0%);
  }

  to {
    transform: translateX(100%);
  }
}
@layer module, state;

@layer state {
  .alert {
    background-color: brown;
  }
  p {
    border: medium solid limegreen;
  }
}

@layer module {
  .alert {
    border: medium solid violet;
    background-color: yellow;
    color: white;
  }
}
@namespace svg url('http://www.w3.org/2000/svg');

a {
  color: orangered;
  text-decoration: underline dashed;
  font-weight: bold;
}

svg|a {
  fill: blueviolet;
  text-decoration: underline solid;
  text-transform: uppercase;
}
abbr {
  color: chocolate;
}

@media (hover: hover) {
  abbr:hover {
    color: limegreen;
    transition-duration: 1s;
  }
}

@media not all and (hover: hover) {
  abbr::after {
    content: ' (' attr(title) ')';
  }
}
@namespace svg url('http://www.w3.org/2000/svg');
@page {
  size: 8.5in 9in;
  margin-top: 4in;
}
@property --property-name {
  syntax: "<color>";
  inherits: false;
  initial-value: #c0ffee;
}
.flex-container > * {
  padding: 0.3em;
  list-style-type: none;
  text-shadow: 0 0 2px red;
  float: left;
}

@supports (display: flex) {
  .flex-container > * {
    text-shadow: 0 0 2px blue;
    float: none;
  }

  .flex-container {
    display: flex;
  }
}
`
}
