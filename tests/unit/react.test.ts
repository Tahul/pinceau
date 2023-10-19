import fs from 'node:fs'
import type { PinceauContext, PinceauQuery } from '@pinceau/core'
import { load, normalizeOptions, parsePinceauQuery, usePinceauContext, usePinceauTransformContext } from '@pinceau/core/utils'
import { suite as styleTransformSuite } from '@pinceau/style/transforms'
import { hasRuntimeStyling } from '@pinceau/style/utils'
import { suite as reactTransormSuite, transformWriteScriptFeatures, transformWriteStyleFeatures } from '@pinceau/react/transforms'
import { createReactPlugin, registerVirtualOutputs } from '@pinceau/react/utils'
import { usePinceauConfigContext } from '@pinceau/theme/utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { paletteLayer, resolveFixtures, resolveTmp } from '../utils'

describe('@pinceau/react', () => {
  describe('utils/load.ts', () => {
    let pinceauContext: PinceauContext
    const baseQuery = parsePinceauQuery(resolveFixtures('./components/react/TestBase.tsx'))

    beforeEach(async () => {
      const options = normalizeOptions()
      options.theme.layers.push(paletteLayer)
      pinceauContext = usePinceauContext(options)
      pinceauContext.fs = fs
    })

    it('can load files', async () => {
      const scriptQuery: PinceauQuery = { ...baseQuery }

      pinceauContext.addTransformed(scriptQuery.filename, scriptQuery)

      const code = await load(scriptQuery.filename, pinceauContext)

      const rawCommponentImport = (await import(`${scriptQuery.filename}?raw`))?.default

      expect(code).toBe(rawCommponentImport)
    })
  })

  describe('utils/runtime-plugin.ts', () => {
    let pinceauContext: PinceauContext

    beforeEach(async () => {
      pinceauContext = usePinceauContext()
    })

    it('should generate runtime plugin with default options', () => {
      const plugin = createReactPlugin(pinceauContext)
      expect(plugin).toContain('export const PinceauReactOptions = {"dev":true,"colorSchemeMode":"media","computedStyles":true,"variants":true,"ssr":{"theme":true,"runtime":true},"appId":false}')
      expect(plugin).toContain('import { useThemeSheet, useRuntimeSheet } from \'@pinceau/runtime\'')
      expect(plugin).toContain('const PinceauContext = createContext()')
      expect(plugin).toContain('export const usePinceauContext = () => useContext(PinceauContext)')
      expect(plugin).toContain('export const PinceauProvider = ({ options, children }) => {')
      expect(plugin).toContain('userOptions = { ...PinceauReactOptions, ...options }')
      expect(plugin).toContain('themeSheet = useThemeSheet(userOptions)')
      expect(plugin).toContain('runtimeSheet = useRuntimeSheet({ themeSheet, ...userOptions })')
      expect(plugin).toContain('const ssr = { toString: () => runtimeSheet.toString()')
      expect(plugin).toContain('return React.createElement(PinceauContext.Provider, {  value: { themeSheet, runtimeSheet, ssr }, children })')
    })

    it('should generate runtime plugin with colorSchemeMode class', () => {
      pinceauContext.options.theme = { colorSchemeMode: 'class' } as any

      const plugin = createReactPlugin(pinceauContext)

      expect(plugin).toContain('"colorSchemeMode":"class"')
    })

    it('should generate runtime plugin with theme disabled', () => {
      // @ts-expect-error
      pinceauContext.options.theme = false

      const plugin = createReactPlugin(pinceauContext)

      expect(plugin).not.toContain('useThemeSheet')
      expect(plugin).not.toContain('themeSheet = useThemeSheet(userOptions)')
      expect(plugin).not.toContain('export let themeSheet')
      expect(plugin).toContain('runtimeSheet = useRuntimeSheet(userOptions)')
    })

    it('should generate runtime plugin with runtime disabled', () => {
      // @ts-expect-error
      pinceauContext.options.runtime = false

      const plugin = createReactPlugin(pinceauContext)

      expect(plugin).not.toContain('useRuntimeSheet')
      expect(plugin).not.toContain('const runtimeSheet = useRuntimeSheet(_options)')
      expect(plugin).not.toContain('app.provide(\'pinceauRuntimeSheet\', runtimeSheet)')
      expect(plugin).not.toContain('app.config.globalProperties.$pinceauSSR')
    })
  })

  describe('utils/virtual.ts', () => {
    let pinceauContext: PinceauContext

    beforeEach(async () => {
      pinceauContext = usePinceauContext({
        theme: {
          buildDir: resolveTmp(),
        },
      })
    })

    it('registers and write react virtual outputs', () => {
      vi.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => { })

      pinceauContext.fs = fs

      registerVirtualOutputs(pinceauContext)

      expect(fs.writeFileSync).toHaveBeenCalledTimes(1)
      expect(pinceauContext.getOutputId('/__pinceau_react_plugin.js')).toBe('@pinceau/outputs/react-plugin')
    })
  })

  describe('transforms/write-script-features.ts', () => {
    let pinceauContext: PinceauContext
    beforeEach(async () => {
      const options = normalizeOptions()
      options.theme.layers.push(paletteLayer)
      pinceauContext = usePinceauContext(options)
      const configCtx = usePinceauConfigContext(pinceauContext)
      await configCtx.buildTheme()
    })

    it('can write style computed styles features', async () => {
      const query = parsePinceauQuery(resolveFixtures('./components/svelte/TestComplete1.tsx'))

      pinceauContext.addTransformed(query.filename, query)

      const transformContext = usePinceauTransformContext(
        'const Button = $styled.button({ color: () => \'red\' })',
        query,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms(reactTransormSuite)

      await transformContext.transform()

      const result = transformContext.result()?.code

      expect(result).toContain('import { usePinceauRuntime, usePinceauComponent } from \'@pinceau/react/runtime\'')
      expect(result).toContain('() => \"red\"')
      expect(result).toContain('usePinceauComponent(\'')
    })

    it('can write style variants features', async () => {
      const query = parsePinceauQuery(resolveFixtures('./components/svelte/TestComplete2.tsx'))

      pinceauContext.addTransformed(query.filename, query)

      const transformContext = usePinceauTransformContext(
        `const Button = () => {
          const styledClass = styled({ color: \'red\', variants: { size: { sm: { width: \'32px\' } } } })

          return (
            <div className={styledClass}></div>
          )
        }`,
        query,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms(reactTransormSuite)

      await transformContext.transform()

      const result = transformContext.result()?.code

      const className = transformContext?.state?.styleFunctions?.script0_styled0.className

      expect(result).toContain('import { usePinceauRuntime } from \'@pinceau/react/runtime\'')
      expect(result).toContain(`const styledClass = usePinceauRuntime(\`${className}\`, undefined, {"size":{"sm":{"width":"32px"}}}, { size })`)
    })
  })

  describe('transforms/variants.ts', () => {
    let pinceauContext: PinceauContext
    beforeEach(async () => {
      const options = normalizeOptions()
      options.theme.layers.push(paletteLayer)
      pinceauContext = usePinceauContext(options)
      pinceauContext.fs = fs
      const configCtx = usePinceauConfigContext(pinceauContext)
      await configCtx.buildTheme()
    })

    it('can resolve withVariants from a $styled component', async () => {
      const query = parsePinceauQuery(resolveFixtures('./components/react/TestVariants.tsx'))

      pinceauContext.addTransformed(query.filename, query)

      const code = await load(query.filename, pinceauContext)

      const transformContext = usePinceauTransformContext(
        code,
        query,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)

      await transformContext.transform()

      expect(hasRuntimeStyling(transformContext)).toBe(true)
      expect(transformContext.state?.styleFunctions?.script0_$styled0).toBeDefined()
      expect(Object.keys(transformContext.state?.styleFunctions?.script0_$styled0?.variants || {}).length).toBe(2)
      expect(transformContext.state?.styleFunctions?.script0_$styled0?.variants?.color).toBeDefined()
      expect(transformContext.state?.styleFunctions?.script0_$styled0?.variants?.size).toBeDefined()
      expect(transformContext.state?.styleFunctions?.script0_$styled0?.helpers).toStrictEqual(['withVariants'])
    })

    it('can push variants to component code', async () => {
      const query = parsePinceauQuery(resolveFixtures('./components/react/TestVariants2.tsx'))

      pinceauContext.addTransformed(query.filename, query)

      const transformContext = usePinceauTransformContext(
        '\nconst test = styled({ variants: { size: { sm: { padding: \'1rem\' } } } })\n',
        query,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms(reactTransormSuite)

      await transformContext.transform()

      expect(transformContext.result()?.code).contains('const test = usePinceauRuntime(undefined, undefined, {"size":{"sm":{"padding":"1rem"}}}, { size })')
    })
  })

  describe('transforms/write-style-features.ts', () => {
    let pinceauContext: PinceauContext
    const baseQuery = parsePinceauQuery(resolveFixtures('./components/react/TestBase.tsx'))

    beforeEach(async () => {
      pinceauContext = usePinceauContext()
    })

    it('can write css content from <script> css() function', async () => {
      const transformContext = usePinceauTransformContext(
        'css({ div: { backgroundColor: \'red\' } })',
        baseQuery,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        scripts: [
          transformWriteScriptFeatures,
          transformWriteStyleFeatures,
        ],
      })

      await transformContext.transform()

      expect(transformContext.result()?.code).toBe(
        `\nimport \'$pinceau/style-functions.css?src=${transformContext.query.filename}&pc-fn=script0_css0\'\n`,
      )
    })
    it('can write styled static class from tsx', async () => {
      const transformContext = usePinceauTransformContext(
        '\nconst testStyled = styled({ backgroundColor: \'red\' })\n',
        baseQuery,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        scripts: [
          transformWriteScriptFeatures,
          transformWriteStyleFeatures,
        ],
      })

      await transformContext.transform()

      const className = transformContext.state.styleFunctions?.script0_styled0?.className

      expect(transformContext.result()?.code).toBe(
        `\nimport '$pinceau/style-functions.css?src=${transformContext.query.filename}&pc-fn=script0_styled0'\n\nconst testStyled = \`${className}\`\n`,
      )
    })
    it('can write styled dynamic and static contexts from tsx', async () => {
      const transformContext = usePinceauTransformContext(
        '\nconst testStyled = styled({ color: () => \'red\', backgroundColor: \'red\' })\n',
        baseQuery,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        scripts: [
          transformWriteScriptFeatures,
          transformWriteStyleFeatures,
        ],
      })

      await transformContext.transform()

      const className = transformContext.state.styleFunctions?.script0_styled0?.className

      const computedStyleKey = transformContext.state.styleFunctions?.script0_styled0?.computedStyles?.[0]?.variable

      expect(transformContext.result()?.code).toBe(
        `\nimport '$pinceau/style-functions.css?src=${transformContext.query.filename}&pc-fn=script0_styled0'\n\nimport { usePinceauRuntime } from \'\@pinceau/react/runtime'\n\nconst testStyled = usePinceauRuntime(\`${className}\`, [[\'${computedStyleKey}\', () => "red"]], undefined, {  })\n\n`,
      )
    })
    it('can write css content from both <script> and styled props', async () => {
      const transformContext = usePinceauTransformContext(
        'const TestComp = () => <div className={styled({ backgroundColor: \'red\' })}>Hello World<a className={styled({ color: \'red\' })}>Test link</a></div>\n'
        + '\nconst testStyled = styled({ backgroundColor: \'red\' })\n\n',
        { ...baseQuery, transformed: true },
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        scripts: [
          transformWriteScriptFeatures,
          transformWriteStyleFeatures,
        ],
      })

      await transformContext.transform()

      const className = transformContext.state.styleFunctions?.script0_styled0?.className
      const secondClassName = transformContext.state.styleFunctions?.script0_styled1?.className
      const thirdClassName = transformContext.state.styleFunctions?.script0_styled2?.className

      const importPath = `import \'$pinceau/style-functions.css?src=${transformContext.query.filename}&pc-fn=script0_styled0\'`
      const secondImportPath = `import \'$pinceau/style-functions.css?src=${transformContext.query.filename}&pc-fn=script0_styled1\'`
      const thirdImportPath = `import \'$pinceau/style-functions.css?src=${transformContext.query.filename}&pc-fn=script0_styled2\'`

      expect(transformContext.result()?.code).toBe(
        `\n${importPath}\n${secondImportPath}\n${thirdImportPath}\n`
        + `const TestComp = () => <div className={\`${className}\`}>Hello World<a className={\`${secondClassName}\`}>Test link</a></div>\n`
        + `\nconst testStyled = \`${thirdClassName}\`\n\n`,
      )
    })
  })
})
