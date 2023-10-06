import fs from 'node:fs'
import type { PinceauContext, PinceauQuery } from '@pinceau/core'
import { load, normalizeOptions, parsePinceauQuery, usePinceauContext, usePinceauTransformContext } from '@pinceau/core/utils'
import { PinceauSvelteTransformer, createSveltePlugin, registerVirtualOutputs } from '@pinceau/svelte/utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { suite as svelteTransformSuite, transformWriteScriptFeatures, transformWriteStyleFeatures } from '@pinceau/svelte/transforms'
import { suite as styleTransformSuite } from '@pinceau/style/transforms'
import { usePinceauConfigContext } from '@pinceau/theme/utils'
import { hasRuntimeStyling } from '@pinceau/style/utils'
import { paletteLayer, resolveFixtures, resolveTmp } from '../utils'

describe('@pinceau/svelte', () => {
  describe('utils/load.ts', () => {
    let pinceauContext: PinceauContext
    const baseQuery = parsePinceauQuery(resolveFixtures('./components/svelte/TestBase.svelte'))

    beforeEach(async () => {
      const options = normalizeOptions()
      options.theme.layers.push(paletteLayer)
      pinceauContext = usePinceauContext(options)
      pinceauContext.registerTransformer('svelte', PinceauSvelteTransformer)
    })

    it('can load style blocks', async () => {
      const styleQuery: PinceauQuery = { ...baseQuery, type: 'style', index: 0 }

      pinceauContext.addTransformed(styleQuery.filename, styleQuery)

      const code = await load(styleQuery.filename, pinceauContext)

      expect(code).toBe(`
  .test-base {
    font-size: 16px;
  }
`)
    })
    it('can load template block', async () => {
      const templateQuery: PinceauQuery = { ...baseQuery, type: 'template' }

      pinceauContext.addTransformed(templateQuery.filename, templateQuery)

      const code = await load(templateQuery.filename, pinceauContext)

      const componentCode = (await import('../fixtures/components/svelte/TestBase.svelte?raw')).default

      expect(code).toBe(componentCode)
    })
    it('can load script block', async () => {
      const scriptQuery: PinceauQuery = { ...baseQuery, type: 'script' }

      pinceauContext.addTransformed(scriptQuery.filename, scriptQuery)

      const code = await load(scriptQuery.filename, pinceauContext)

      expect(code).toBe(`
  export const test = 'hello world'

  console.log('hello world')
`)
    })
  })

  describe('utils/runtime-plugin.ts', () => {
    let pinceauContext: PinceauContext

    beforeEach(async () => {
      pinceauContext = usePinceauContext()
    })

    it('should generate runtime plugin with default options', () => {
      const plugin = createSveltePlugin(pinceauContext)

      expect(plugin).toContain('export const PinceauSvelteOptions = {"dev":true,"colorSchemeMode":"media","computedStyles":true,"variants":true,"ssr":{"theme":true,"runtime":true},"appId":false}')
      expect(plugin).toContain('import { useThemeSheet, useRuntimeSheet } from \'@pinceau/runtime\'')
      expect(plugin).toContain('let userOptions')
      expect(plugin).toContain('export let themeSheet')
      expect(plugin).toContain('export let runtimeSheet')
      expect(plugin).toContain('export const pinceauPlugin = (options) => {')
      expect(plugin).toContain('userOptions = { ...PinceauSvelteOptions, ...options }')
      expect(plugin).toContain('themeSheet = useThemeSheet(userOptions)')
      expect(plugin).toContain('runtimeSheet = useRuntimeSheet({ themeSheet, ...userOptions })')
      expect(plugin).toContain(`export const ssr = { toString: () => runtimeSheet.toString()`)
    })

    it('should generate runtime plugin with colorSchemeMode class', () => {
      pinceauContext.options.theme = { colorSchemeMode: 'class' } as any

      const plugin = createSveltePlugin(pinceauContext)

      expect(plugin).toContain('"colorSchemeMode":"class"')
    })

    it('should generate runtime plugin with theme disabled', () => {
      // @ts-ignore
      pinceauContext.options.theme = false

      const plugin = createSveltePlugin(pinceauContext)

      expect(plugin).not.toContain('useThemeSheet')
      expect(plugin).not.toContain('themeSheet = useThemeSheet(userOptions)')
      expect(plugin).not.toContain('export let themeSheet')
      expect(plugin).toContain('runtimeSheet = useRuntimeSheet(userOptions)')
    })

    it('should generate runtime plugin with runtime disabled', () => {
      // @ts-ignore
      pinceauContext.options.runtime = false

      const plugin = createSveltePlugin(pinceauContext)

      expect(plugin).not.toContain('useRuntimeSheet')
      expect(plugin).not.toContain('const runtimeSheet = useRuntimeSheet(_options)')
      expect(plugin).not.toContain('app.provide(\'pinceauRuntimeSheet\', runtimeSheet)')
      expect(plugin).not.toContain('app.config.globalProperties.$pinceauSSR')
    })
  })

  describe('utils/transformer.ts', () => {
    it('transformer to be complete', () => {
      // Each of transformer parts are tested independently
      expect(PinceauSvelteTransformer.MagicSFC).toBeDefined()
      expect(PinceauSvelteTransformer.loadBlock).toBeDefined()
      expect(PinceauSvelteTransformer.loadTransformers!.length).toBe(0)
      expect(PinceauSvelteTransformer.classBinding).toBeDefined()
      expect(PinceauSvelteTransformer.extractProp).toBeDefined()
      expect(PinceauSvelteTransformer.parser).toBeDefined()
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

    it('registers and write vue virtual outputs', () => {
      vi.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => { })

      registerVirtualOutputs(pinceauContext)

      expect(fs.writeFileSync).toHaveBeenCalledTimes(2)
      expect(pinceauContext.getOutputId('/__pinceau_runtime.js')).toBe('$pinceau')
      expect(pinceauContext.getOutputId('/__pinceau_svelte_plugin.js')).toBe('$pinceau/svelte-plugin')
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
      pinceauContext.registerTransformer('svelte', PinceauSvelteTransformer)
    })

    it('can write styled features when script is missing', async () => {
      const query = parsePinceauQuery(resolveFixtures('./components/svelte/TestComplete1.svelte'))

      pinceauContext.addTransformed(query.filename, query)

      const transformContext = usePinceauTransformContext(
        '<div styled={{ color: () => \'red\' }}>Hello World</div>\n',
        query,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms(svelteTransformSuite)

      await transformContext.transform()

      const result = transformContext.result()?.code

      expect(result).toContain('import { usePinceauRuntime } from \'@pinceau/svelte/runtime\'')
      expect(result).toContain('() => \'red\'')
      expect(result).toContain('usePinceauRuntime(`')
      expect(result).toContain('$template0_styled0')
    })

    it('can write style computed styles features', async () => {
      const query = parsePinceauQuery(resolveFixtures('./components/svelte/TestComplete1.svelte'))

      pinceauContext.addTransformed(query.filename, query)

      const transformContext = usePinceauTransformContext(
        '<div styled={{ color: () => \'blue\' }}>Hello World</div>\n<script>css({ div: { color: () => \'red\' } })</script>',
        query,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms(svelteTransformSuite)

      await transformContext.transform()

      const result = transformContext.result()?.code

      expect(result).toContain('import { usePinceauRuntime } from \'@pinceau/svelte/runtime\'')
      expect(result).toContain('() => \'red\'')
      expect(result).toContain('() => \'blue\'')
      expect(result).toContain('usePinceauRuntime(`')
    })

    it('can write style variants features', async () => {
      const query = parsePinceauQuery(resolveFixtures('./components/svelte/TestComplete2.svelte'))

      pinceauContext.addTransformed(query.filename, query)

      const transformContext = usePinceauTransformContext(
        '<div class={testStyled}>Hello World</div>\n<script>\n$: testStyled = styled({ color: \'red\', variants: { size: { sm: { width: \'32px\' } } } })\n</script>',
        query,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms(svelteTransformSuite)

      await transformContext.transform()

      const result = transformContext.result()?.code

      console.log(result)

      const className = transformContext?.state?.styleFunctions?.['script0_styled0'].className

      expect(result).toContain('import { usePinceauRuntime } from \'@pinceau/svelte/runtime\'')
      expect(result).toContain(`$: testStyled = usePinceauRuntime(\`${className}\`, undefined, {"size":{"sm":{"width":"32px"}}}, { size })`)
      expect(result).toContain('export let size')
    })
  })

  describe('transforms/variants.ts', () => {
    let pinceauContext: PinceauContext
    beforeEach(async () => {
      const options = normalizeOptions()
      options.theme.layers.push(paletteLayer)
      pinceauContext = usePinceauContext(options)
      const configCtx = usePinceauConfigContext(pinceauContext)
      await configCtx.buildTheme()
      pinceauContext.registerTransformer('svelte', PinceauSvelteTransformer)
    })

    it('can resolve variants from a svelte component', async () => {
      const query = parsePinceauQuery(resolveFixtures('./components/svelte/TestVariants.svelte'))

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
      expect(transformContext.state?.styleFunctions?.script0_styled0).toBeDefined()
      expect(Object.keys(transformContext.state?.styleFunctions?.script0_styled0?.variants || {}).length).toBe(2)
      expect(transformContext.state?.styleFunctions?.script0_styled0?.variants?.color).toBeDefined()
      expect(transformContext.state?.styleFunctions?.script0_styled0?.variants?.size).toBeDefined()
    })

    it.only('can resolve variants from a svelte component even with multiple <script> tags', async () => {
      const query = parsePinceauQuery(resolveFixtures('./components/svelte/TestVariants.svelte'))

      pinceauContext.addTransformed(query.filename, query)

      const code = await load(query.filename, pinceauContext)

      const transformContext = usePinceauTransformContext(
        code + `<div><script lang="ts">const hello: string = 'world';</script></div>`,
        query,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)

      await transformContext.transform()

      expect(hasRuntimeStyling(transformContext)).toBe(true)
      expect(transformContext.state?.styleFunctions?.script0_styled0).toBeDefined()
      expect(Object.keys(transformContext.state?.styleFunctions?.script0_styled0?.variants || {}).length).toBe(2)
      expect(transformContext.state?.styleFunctions?.script0_styled0?.variants?.color).toBeDefined()
      expect(transformContext.state?.styleFunctions?.script0_styled0?.variants?.size).toBeDefined()
    })

    it('can push $pcExtractedVariants to component code', async () => {
      const query = parsePinceauQuery(resolveFixtures('./components/svelte/TestVariants2.svelte'))

      pinceauContext.addTransformed(query.filename, query)

      const transformContext = usePinceauTransformContext(
        '<script>\nstyled({ variants: { size: { sm: { padding: \'1rem\' } } } })\n</script>',
        query,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms(svelteTransformSuite)

      await transformContext.transform()

      const className = transformContext.state.styleFunctions?.script0_styled0?.className

      expect(transformContext.result()?.code).contains(`usePinceauRuntime(\`${className}\`, undefined, {"size":{"sm":{"padding":"1rem"}}}, { size })`)
    })

    it('can push props to component existing script with props and imports', async () => {
      const query = parsePinceauQuery(resolveFixtures('./components/svelte/TestVariants3.svelte'))

      pinceauContext.addTransformed(query.filename, query)

      const transformContext = usePinceauTransformContext(
        '<script setup lang="ts">\nimport { test } from \'any-strange-module\'\nexport let secondTest: string = \`hello\`\n$: testStyled = styled({ variants: { size: { sm: { padding: \'1rem\' } } } })\n</script>',
        query,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms(svelteTransformSuite)

      await transformContext.transform()

      expect(transformContext.result()?.code).contains(`export let size`)
    })
  })

  describe('transforms/write-style-features.ts', () => {
    let pinceauContext: PinceauContext
    const baseQuery = parsePinceauQuery(resolveFixtures('./components/svelte/TestBase.svelte'))

    beforeEach(async () => {
      pinceauContext = usePinceauContext()
      pinceauContext.registerTransformer('svelte', PinceauSvelteTransformer)
    })

    it('can write css content from <script> css() function', async () => {
      const transformContext = usePinceauTransformContext(
        '<script>css({ div: { backgroundColor: \'red\' } })</script>',
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
        '<script>\nimport \'$pinceau/style-functions.css?src=/Users/yaelguilloux/Code/sandbox/pinceau/tests/fixtures/components/svelte/TestBase.svelte&pc-fn=script0_css0\'\n</script>'
      )
    })
    it('can write styled static class from <script>', async () => {
      const transformContext = usePinceauTransformContext(
        '<script>\nconst testStyled = styled({ backgroundColor: \'red\' })\n</script>',
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
        `<script>\nimport '$pinceau/style-functions.css?src=/Users/yaelguilloux/Code/sandbox/pinceau/tests/fixtures/components/svelte/TestBase.svelte&pc-fn=script0_styled0'\n\nconst testStyled = \`${className}\`\n</script>`
      )
    })
    it('can write styled dynamic and static contexts from <script>', async () => {
      const transformContext = usePinceauTransformContext(
        '<script>\nconst testStyled = styled({ color: () => \'red\', backgroundColor: \'red\' })\n</script>',
        baseQuery,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        scripts: [
          transformWriteStyleFeatures,
          transformWriteScriptFeatures,
        ],
      })

      await transformContext.transform()

      const className = transformContext.state.styleFunctions?.script0_styled0?.className

      const computedStyleKey = transformContext.state.styleFunctions?.script0_styled0?.computedStyles?.[0]?.variable

      expect(transformContext.result()?.code).toBe(
        `<script>\nimport { usePinceauRuntime } from \'\@pinceau/svelte/runtime'\n\nimport '$pinceau/style-functions.css?src=/Users/yaelguilloux/Code/sandbox/pinceau/tests/fixtures/components/svelte/TestBase.svelte&pc-fn=script0_styled0'\n\nconst testStyled = usePinceauRuntime(\`${className}\`, [[\'${computedStyleKey}\', () => 'red']], undefined, {  })\n\n</script>`
      )
    })
    it('can write css content from both <script> and styled props', async () => {
      const transformContext = usePinceauTransformContext(
        '<div styled={{ backgroundColor: \'red\' }}>Hello World<a styled={{ color: \'red\' }}>Test link</a></div>\n'
        + '<script>\nconst testStyled = styled({ backgroundColor: \'red\' })\n</script>\n',
        { ...baseQuery, transformed: true },
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        scripts: [
          transformWriteScriptFeatures,
          transformWriteStyleFeatures,
        ]
      })

      await transformContext.transform()

      console.log(transformContext.sfc)

      const className = transformContext.state.styleFunctions?.template0_styled0?.className
      const secondClassName = transformContext.state.styleFunctions?.template0_styled1?.className
      const thirdClassName = transformContext.state.styleFunctions?.script0_styled0?.className

      const importPath = `import '$pinceau/style-functions.css?src=/Users/yaelguilloux/Code/sandbox/pinceau/tests/fixtures/components/svelte/TestBase.svelte&pc-fn=template0_styled0'`
      const secondImportPath = `import '$pinceau/style-functions.css?src=/Users/yaelguilloux/Code/sandbox/pinceau/tests/fixtures/components/svelte/TestBase.svelte&pc-fn=template0_styled1'`
      const thirdImportPath = `import '$pinceau/style-functions.css?src=/Users/yaelguilloux/Code/sandbox/pinceau/tests/fixtures/components/svelte/TestBase.svelte&pc-fn=script0_styled0'`

      expect(transformContext.result()?.code).toBe(
        `<div class="${className}" pcsp>Hello World<a class="${secondClassName}" pcsp>Test link</a></div>\n` +
        `<script>\n${importPath}\n${secondImportPath}\n${thirdImportPath}\n\nconst testStyled = \`${thirdClassName}\`\n</script>\n`
      )
    })
  })
})
