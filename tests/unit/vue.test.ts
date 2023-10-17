import fs from 'node:fs'
import type { PinceauContext, PinceauQuery } from '@pinceau/core'
import { load, normalizeOptions, parsePinceauQuery, usePinceauContext, usePinceauTransformContext } from '@pinceau/core/utils'
import { suite as styleTransformSuite } from '@pinceau/style/transforms'
import { hasRuntimeStyling } from '@pinceau/style/utils'
import { usePinceauConfigContext } from '@pinceau/theme/utils'
import { transformAddPinceauClass, transformStyleTs, transformWriteScriptFeatures, transformWriteStyleFeatures, suite as vueTransformSuite } from '@pinceau/vue/transforms'
import { PinceauVueTransformer, createVuePlugin, registerVirtualOutputs } from '@pinceau/vue/utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { paletteLayer, resolveFixtures, resolveTmp } from '../utils'

describe('@pinceau/vue', () => {
  describe('utils/load.ts', () => {
    let pinceauContext: PinceauContext
    const baseQuery = parsePinceauQuery(resolveFixtures('./components/vue/TestBase.vue'))

    beforeEach(async () => {
      const options = normalizeOptions()
      options.theme.layers.push(paletteLayer)
      pinceauContext = usePinceauContext(options)
      pinceauContext.fs = fs
      pinceauContext.registerTransformer('vue', PinceauVueTransformer)
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

      expect(code).toBe(`
  <div class="test-base">
    Basic Vue component
  </div>
`)
    })
    it('can load script block', async () => {
      const scriptQuery: PinceauQuery = { ...baseQuery, type: 'script' }

      pinceauContext.addTransformed(scriptQuery.filename, scriptQuery)

      const code = await load(scriptQuery.filename, pinceauContext)

      expect(code).toBe(`
export const test = 'hello world'
`)
    })
    it('can load script setup block', async () => {
      const scriptSetupQuery: PinceauQuery = { ...baseQuery, type: 'script', setup: true }

      pinceauContext.addTransformed(scriptSetupQuery.filename, scriptSetupQuery)

      const code = await load(scriptSetupQuery.filename, pinceauContext)

      expect(code).toBe(`
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
      const plugin = createVuePlugin(pinceauContext)

      expect(plugin).toContain('export const PinceauVueOptions = {"dev":true,"colorSchemeMode":"media","computedStyles":true,"variants":true,"ssr":{"theme":true,"runtime":true},"appId":false}')
      expect(plugin).toContain('import { useThemeSheet, useRuntimeSheet } from \'@pinceau/runtime\'')
      expect(plugin).toContain('const themeSheet = useThemeSheet(_options)\n    app.provide(\'pinceauThemeSheet\', themeSheet)')
      expect(plugin).toContain('const runtimeSheet = useRuntimeSheet({ themeSheet, ..._options })\n    app.provide(\'pinceauRuntimeSheet\', runtimeSheet)')
      expect(plugin).toContain('const _options = { ...PinceauVueOptions, ...options }')
      expect(plugin).toContain('app.config.globalProperties.$pinceauSSR = { toString: () => runtimeSheet.toString() }')
    })

    it('should generate runtime plugin with colorSchemeMode class', () => {
      pinceauContext.options.theme = { colorSchemeMode: 'class' } as any

      const plugin = createVuePlugin(pinceauContext)

      expect(plugin).toContain('"colorSchemeMode":"class"')
    })

    it('should generate runtime plugin with theme disabled', () => {
      // @ts-expect-error
      pinceauContext.options.theme = false

      const plugin = createVuePlugin(pinceauContext)

      expect(plugin).not.toContain('useThemeSheet')
      expect(plugin).not.toContain('const themeSheet = useThemeSheet(_options)\n    app.provide(\'pinceauThemeSheet\', themeSheet)')
      expect(plugin).toContain('const runtimeSheet = useRuntimeSheet(_options)\n    app.provide(\'pinceauRuntimeSheet\', runtimeSheet)')
    })

    it('should generate runtime plugin with runtime disabled', () => {
      // @ts-expect-error
      pinceauContext.options.runtime = false

      const plugin = createVuePlugin(pinceauContext)

      expect(plugin).not.toContain('useRuntimeSheet')
      expect(plugin).not.toContain('const runtimeSheet = useRuntimeSheet(_options)')
      expect(plugin).not.toContain('app.provide(\'pinceauRuntimeSheet\', runtimeSheet)')
      expect(plugin).not.toContain('app.config.globalProperties.$pinceauSSR')
    })
  })

  describe('utils/transformer.ts', () => {
    it('transformer to be complete', () => {
      // Each of transformer parts are tested independently
      expect(PinceauVueTransformer.MagicSFC).toBeDefined()
      expect(PinceauVueTransformer.loadBlock).toBeDefined()
      expect(PinceauVueTransformer.loadTransformers?.length).toBeGreaterThan(0)
      expect(PinceauVueTransformer.classBinding).toBeDefined()
      expect(PinceauVueTransformer.extractProp).toBeDefined()
      expect(PinceauVueTransformer.parser).toBeDefined()
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

      expect(fs.writeFileSync).toHaveBeenCalledTimes(1)
      expect(pinceauContext.getOutputId('/__pinceau_vue_plugin.js')).toBe('$pinceau/vue-plugin')
    })
  })

  describe('transforms/add-class.ts', () => {
    let pinceauContext: PinceauContext
    const variantsQuery = parsePinceauQuery(resolveFixtures('./components/vue/TestVariants.vue'))

    beforeEach(async () => {
      pinceauContext = usePinceauContext()
      pinceauContext.registerTransformer('vue', PinceauVueTransformer)
    })

    it('adds class to root element of a template', async () => {
      const transformContext = usePinceauTransformContext(
        '<template>'
        + '<div class="test-variants">Variants component</div>'
        + '</template>',
        variantsQuery,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        templates: [
          transformAddPinceauClass,
        ],
      })

      // Add mocked runtime styleFunction
      transformContext.state.styleFunctions = transformContext.state.styleFunctions || {}
      transformContext.state.styleFunctions.style0_styled0 = {
        id: 'style0_styled0',
        computedStyles: [{}],
      } as any

      await transformContext.transform()

      expect(transformContext.result()?.code).toStrictEqual(
        '<template>'
        + '<div class="test-variants" :class="[$style0_styled0]">Variants component</div>'
        + '</template>',
      )
    })
    it('adds class to all root elements of a template', async () => {
      const transformContext = usePinceauTransformContext(
        '<template>'
        + '<div class="test-variants">Variants component</div>'
        + '<div><section><button type="button">Hello World</button></section></div>'
        + '</template>',
        variantsQuery,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        templates: [
          transformAddPinceauClass,
        ],
      })

      // Add mocked runtime styleFunction
      transformContext.state.styleFunctions = transformContext.state.styleFunctions || {}
      transformContext.state.styleFunctions.style0_styled0 = {
        id: 'style0_styled0',
        computedStyles: [{}],
      } as any

      await transformContext.transform()

      expect(transformContext.result()?.code).toStrictEqual(
        '<template>'
        + '<div class="test-variants" :class="[$style0_styled0]">Variants component</div>'
        + '<div :class="[$style0_styled0]"><section><button type="button">Hello World</button></section></div>'
        + '</template>',
      )
    })
    it('adds class to existing :class attribute (object)', async () => {
      const transformContext = usePinceauTransformContext(
        '<template>'
        + '<div :class="{ \'test-variants\': true }">Variants component</div>'
        + '<div><section><button type="button">Hello World</button></section></div>'
        + '</template>',
        variantsQuery,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        templates: [
          transformAddPinceauClass,
        ],
      })

      // Add mocked runtime styleFunction
      transformContext.state.styleFunctions = transformContext.state.styleFunctions || {}
      transformContext.state.styleFunctions.style0_styled0 = {
        id: 'style0_styled0',
        computedStyles: [{}],
      } as any

      await transformContext.transform()

      expect(transformContext.result()?.code).toStrictEqual(
        '<template>'
        + '<div :class="[$style0_styled0, { \'test-variants\': true }]">Variants component</div>'
        + '<div :class="[$style0_styled0]"><section><button type="button">Hello World</button></section></div>'
        + '</template>',
      )
    })
    it('adds class to existing :class attribute (array)', async () => {
      const transformContext = usePinceauTransformContext(
        '<template>'
        + '<div :class="[\'test-variants\']">Variants component</div>'
        + '<div><section><button type="button">Hello World</button></section></div>'
        + '</template>',
        variantsQuery,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        templates: [
          transformAddPinceauClass,
        ],
      })

      // Add mocked runtime styleFunction
      transformContext.state.styleFunctions = transformContext.state.styleFunctions || {}
      transformContext.state.styleFunctions.style0_styled0 = {
        id: 'style0_styled0',
        computedStyles: [{}],
      } as any

      await transformContext.transform()

      expect(transformContext.result()?.code).toStrictEqual(
        '<template>'
        + '<div :class="[$style0_styled0, \'test-variants\']">Variants component</div>'
        + '<div :class="[$style0_styled0]"><section><button type="button">Hello World</button></section></div>'
        + '</template>',
      )
    })
    it('adds class to existing :class attribute (string)', async () => {
      const transformContext = usePinceauTransformContext(
        '<template>'
        + '<div :class="\'test-variants\'">Variants component</div>'
        + '<div><section><button type="button">Hello World</button></section></div>'
        + '</template>',
        variantsQuery,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        templates: [
          transformAddPinceauClass,
        ],
      })

      // Add mocked runtime styleFunction
      transformContext.state.styleFunctions = transformContext.state.styleFunctions || {}
      transformContext.state.styleFunctions.style0_styled0 = {
        id: 'style0_styled0',
        computedStyles: [{}],
      } as any

      await transformContext.transform()

      expect(transformContext.result()?.code).toStrictEqual(
        '<template>'
        + '<div :class="[$style0_styled0, \'test-variants\']">Variants component</div>'
        + '<div :class="[$style0_styled0]"><section><button type="button">Hello World</button></section></div>'
        + '</template>',
      )
    })
    it('adds class to existing :class attribute (identifier)', async () => {
      const transformContext = usePinceauTransformContext(
        '<template>'
        + '<div :class="test">Variants component</div>'
        + '<div><section><button type="button">Hello World</button></section></div>'
        + '</template>'
        + '<style lang="ts">styled({ color: \'red\' })</style>',
        variantsQuery,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        templates: [
          transformAddPinceauClass,
        ],
      })

      // Add mocked runtime styleFunction
      transformContext.state.styleFunctions = transformContext.state.styleFunctions || {}
      transformContext.state.styleFunctions.style0_styled0 = {
        id: 'style0_styled0',
        computedStyles: [{}],
      } as any

      await transformContext.transform()

      expect(transformContext.result()?.code).toContain(
        '<template>'
        + '<div :class="[$style0_styled0, test]">Variants component</div>'
        + '<div :class="[$style0_styled0]"><section><button type="button">Hello World</button></section></div>'
        + '</template>',
      )
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
      pinceauContext.registerTransformer('vue', PinceauVueTransformer)
    })

    it('can write style computed styles features when script is missing', async () => {
      const query = parsePinceauQuery(resolveFixtures('./components/vue/TestComplete1.vue'))

      pinceauContext.addTransformed(query.filename, query)

      const transformContext = usePinceauTransformContext(
        '<template><div :styled="{ color: () => \'blue\' }">Hello World</div></template>\n<style pctransformed>css({ div: { color: () => \'red\' } })</style>',
        query,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms(vueTransformSuite)

      await transformContext.transform()

      const result = transformContext.result()?.code

      expect(result).toContain('import { usePinceauRuntime } from \'@pinceau/vue/runtime\'')
      expect(result).toContain('() => \"red\"')
      expect(result).toContain('() => \'blue\'')
      expect(result).toContain('usePinceauRuntime(`')
    })

    it('can write style variants features when script is missing', async () => {
      const query = parsePinceauQuery(resolveFixtures('./components/vue/TestComplete2.vue'))

      pinceauContext.addTransformed(query.filename, query)

      const transformContext = usePinceauTransformContext(
        '<template><div>Hello World</div></template>\n<style pctransformed>styled({ variants: { size: { sm: { width: \'32px\' } } } })</style>',
        query,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms(vueTransformSuite)

      await transformContext.transform()

      const result = transformContext.result()?.code

      expect(result).toContain('import { usePinceauRuntime } from \'@pinceau/vue/runtime\'')
      expect(result).toContain('const $style0_styled0 = usePinceauRuntime(undefined, undefined, {"size":{"sm":{"width":"32px"}}}, undefined)')
      expect(result).toContain('defineProps({"size":{"required":false,"type":[String, Object]}})')
    })
  })

  describe('transforms/style-lang-ts.ts', () => {
    it('should replace lang="ts" with and pctransformed in a <style> tag', () => {
      const code = '<style lang="ts"></style>'
      const transformedCode = transformStyleTs(code)
      expect(transformedCode).toBe('<style pctransformed></style>')
    })

    it('should correctly handle multiple <style> tags with lang="ts" attributes', () => {
      const code = '<style lang="ts"></style><style lang="ts"></style>'
      const transformedCode = transformStyleTs(code)
      expect(transformedCode).toBe('<style pctransformed></style><style pctransformed></style>')
    })

    it('should not modify other <style> tags', () => {
      const code = '<style></style><style lang="scss"></style>'
      const transformedCode = transformStyleTs(code)
      expect(transformedCode).toBe('<style></style><style lang="scss"></style>')
    })

    it('should not modify other lang="ts" tags', () => {
      const code = '<script lang="ts"></script>'
      const transformedCode = transformStyleTs(code)
      expect(transformedCode).toBe('<script lang="ts"></script>')
    })

    it('should not modify <style> tags that have a lang attribute with a value other than "ts", "tsx", "js", or "jsx"', () => {
      const code = '<style lang="css"></style>'
      const transformedCode = transformStyleTs(code)
      expect(transformedCode).toBe('<style lang="css"></style>')
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
      pinceauContext.registerTransformer('vue', PinceauVueTransformer)
    })

    it('can resolve variants from a vue component', async () => {
      const query = parsePinceauQuery(resolveFixtures('./components/vue/TestVariants.vue'))

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
      expect(transformContext.state?.styleFunctions?.style0_css0).toBeDefined()
      expect(Object.keys(transformContext.state?.styleFunctions?.style0_css0?.variants || {}).length).toBe(2)
      expect(transformContext.state?.styleFunctions?.style0_css0?.variants?.color).toBeDefined()
      expect(transformContext.state?.styleFunctions?.style0_css0?.variants?.size).toBeDefined()
    })

    it('can push variants to component code', async () => {
      const query = parsePinceauQuery(resolveFixtures('./components/vue/TestVariants2.vue'))

      pinceauContext.addTransformed(query.filename, query)

      const transformContext = usePinceauTransformContext(
        '<style pctransformed>\nstyled({ variants: { size: { sm: { padding: \'1rem\' } } } })\n</style>',
        query,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms(vueTransformSuite)

      await transformContext.transform()

      expect(transformContext.result()?.code).contains('usePinceauRuntime(undefined, undefined, {"size":{"sm":{"padding":"1rem"}}}, undefined)')
    })

    it('can push props to component existing empty defineProps()', async () => {
      const query = parsePinceauQuery(resolveFixtures('./components/vue/TestVariants3.vue'))

      const propDef = '{"size":{"required":false,"type":[String, Object] as ResponsiveProp<\'sm\'>}}'

      pinceauContext.addTransformed(query.filename, query)

      const transformContext = usePinceauTransformContext(
        '<script setup lang="ts">defineProps()</script>\n<style pctransformed>\nstyled({ variants: { size: { sm: { padding: \'1rem\' } } } })\n</style>',
        query,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms(vueTransformSuite)

      await transformContext.transform()

      expect(transformContext.result()?.code).contains(`defineProps(${propDef})`)
    })

    it('can push props to component existing object defined defineProps({ ... })', async () => {
      const query = parsePinceauQuery(resolveFixtures('./components/vue/TestVariants4.vue'))

      const propDef = '{"size":{"required":false,"type":[String, Object] as ResponsiveProp<\'sm\'>}}'

      pinceauContext.addTransformed(query.filename, query)

      const transformContext = usePinceauTransformContext(
        '<script setup lang="ts">defineProps({ test: { type: String, required: false } })</script>\n<style pctransformed>\nstyled({ variants: { size: { sm: { padding: \'1rem\' } } } })\n</style>',
        query,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms(vueTransformSuite)

      await transformContext.transform()

      expect(transformContext.result()?.code).contains(`defineProps({\n    test: {\n        type: String,\n        required: false\n    },\n\n    ...${propDef}\n})`)
    })

    it('can push props to component existing type defined defineProps<{ ... }>()', async () => {
      const query = parsePinceauQuery(resolveFixtures('./components/vue/TestVariants5.vue'))

      const propDef = `{
    size?: ResponsiveProp<'sm'>
}`

      pinceauContext.addTransformed(query.filename, query)

      const transformContext = usePinceauTransformContext(
        '<script setup lang="ts">defineProps<{ test?: String }>()</script>\n<style pctransformed>\nstyled({ variants: { size: { sm: { padding: \'1rem\' } } } })\n</style>',
        query,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms(vueTransformSuite)

      await transformContext.transform()

      expect(transformContext.result()?.code).contains(`defineProps<${propDef} & {\n    test?: String;\n}>()`)
    })

    it('can push props to component existing type defined withDefaults(defineProps<{ ... }>(), { ... })', async () => {
      const query = parsePinceauQuery(resolveFixtures('./components/vue/TestVariants6.vue'))

      const propDef = `{
    size?: ResponsiveProp<'sm'>
}`

      const defaultsDef = '{"size":"sm"}'

      pinceauContext.addTransformed(query.filename, query)

      const transformContext = usePinceauTransformContext(
        '<script setup lang="ts">withDefaults(defineProps<{ test?: String }>(), { test: \'hello world\' })</script>\n<style pctransformed>\nstyled({ variants: { size: { sm: { padding: \'1rem\' }, options: { default: \'sm\' } } } })\n</style>',
        query,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms(vueTransformSuite)

      await transformContext.transform()

      expect(transformContext.result()?.code).contains(`withDefaults(defineProps<${propDef} & {\n    test?: String;\n}>(), {\n    test: "hello world",\n    ...${defaultsDef}\n})`)
    })
  })

  describe('transforms/write-style-features.ts', () => {
    let pinceauContext: PinceauContext
    const baseQuery = parsePinceauQuery(resolveFixtures('./components/vue/TestBase.vue'))

    beforeEach(async () => {
      pinceauContext = usePinceauContext()
      pinceauContext.registerTransformer('vue', PinceauVueTransformer)
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
          transformWriteStyleFeatures,
          transformWriteScriptFeatures,
        ],
      })

      await transformContext.transform()

      expect(transformContext.result()?.code).toBe(
        '<script></script>\n'
        + '<style scoped pc-fn="script0_css0">div{background-color:red;}</style>',
      )
    })
    it('can write css content from <script> styled() function', async () => {
      const transformContext = usePinceauTransformContext(
        '<script>const testStyled = styled({ backgroundColor: \'red\' })</script>',
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

      expect(transformContext.result()?.code).toBe(
        `<script>const testStyled = \`${className}\`</script>\n`
        + `<style scoped pc-fn="script0_styled0">.${className}{background-color:red;}</style>`,
      )
    })
    it('can write css pointer from <style> styled() function', async () => {
      const transformContext = usePinceauTransformContext(
        '<style pctransformed>styled({ backgroundColor: \'red\' })</style>',
        { ...baseQuery, transformed: true },
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        styles: [
          transformWriteStyleFeatures,
        ],
      })

      await transformContext.transform()

      const styleFunction = transformContext.state.styleFunctions?.style0_styled0

      expect(transformContext.result()?.code).toBe(`<style pctransformed>/* ${styleFunction?.pointer} */\n.${styleFunction?.className}{background-color:red;}\n</style>`)
    })
    it('can write css content from <style> css() function', async () => {
      const transformContext = usePinceauTransformContext(
        '<style pctransformed>css({ div: { backgroundColor: \'red\' } })</style>',
        { ...baseQuery, transformed: true },
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        styles: [
          transformWriteStyleFeatures,
        ],
      })

      await transformContext.transform()

      const styleFunction = transformContext.state.styleFunctions?.style0_css0

      expect(transformContext.result()?.code).toBe(`<style pctransformed>/* ${styleFunction?.pointer} */\ndiv{background-color:red;}\n</style>`)
    })
    it('can write css pointers from multiple <style> css() function', async () => {
      const transformContext = usePinceauTransformContext(
        '<style pctransformed>css({ div: { backgroundColor: \'red\' } })</style>\n'
        + '<style pctransformed>css({ button: { backgroundColor: \'blue\' } })</style>',
        { ...baseQuery, transformed: true },
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        styles: [
          transformWriteStyleFeatures,
        ],
      })

      await transformContext.transform()

      const firstStyleFunction = transformContext.state.styleFunctions?.style0_css0
      const secondStyleFunction = transformContext.state.styleFunctions?.style1_css0

      expect(transformContext.result()?.code).toBe(
        `<style pctransformed>/* ${firstStyleFunction?.pointer} */\ndiv{background-color:red;}\n</style>\n`
        + `<style pctransformed>/* ${secondStyleFunction?.pointer} */\nbutton{background-color:blue;}\n</style>`,
      )
    })
    it('can write css contents from multiple <style> css() function on vueQuery', async () => {
      const transformContext = usePinceauTransformContext(
        '<style pctransformed>css({ div: { backgroundColor: \'red\' } })</style>\n'
        + '<style pctransformed>css({ button: { backgroundColor: \'blue\' } })</style>',
        { ...baseQuery, transformed: true, vueQuery: true },
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        styles: [
          transformWriteStyleFeatures,
        ],
      })

      await transformContext.transform()

      const firstStyleFunction = transformContext.state.styleFunctions?.style0_css0
      const secondStyleFunction = transformContext.state.styleFunctions?.style1_css0

      expect(transformContext.result()?.code).toBe(
        `<style pctransformed>/* ${firstStyleFunction?.pointer} */\ndiv{background-color:red;}\n</style>\n`
        + `<style pctransformed>/* ${secondStyleFunction?.pointer} */\nbutton{background-color:blue;}\n</style>`,
      )
    })
    it('can write css content from <template> styled prop', async () => {
      const transformContext = usePinceauTransformContext(
        '<template><div :styled="{ backgroundColor: \'red\' }">Hello World</div></template>',
        { ...baseQuery, transformed: true },
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        templates: [
          transformWriteStyleFeatures,
        ],
      })

      await transformContext.transform()

      const className = transformContext.state.styleFunctions?.template0_styled0?.className

      expect(transformContext.result()?.code).toBe(
        `<template><div class="${className}" pcsp>Hello World</div></template>\n`
        + `<style scoped pc-fn="template0_styled0">.${className}[pcsp]{background-color:red;}</style>`,
      )
    })
    it('can write css content from multiple <template> styled prop', async () => {
      const transformContext = usePinceauTransformContext(
        '<template><div :styled="{ backgroundColor: \'red\' }">Hello World<a :styled="{ color: \'red\' }">Test link</a></div></template>',
        { ...baseQuery, transformed: true },
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        templates: [
          transformWriteStyleFeatures,
        ],
      })

      await transformContext.transform()

      const className = transformContext.state.styleFunctions?.template0_styled0?.className
      const secondClassName = transformContext.state.styleFunctions?.template0_styled1?.className

      expect(transformContext.result()?.code).toBe(
        `<template><div class="${className}" pcsp>Hello World<a class="${secondClassName}" pcsp>Test link</a></div></template>\n`
        + `<style scoped pc-fn="template0_styled0">.${className}[pcsp]{background-color:red;}</style>\n`
        + `<style scoped pc-fn="template0_styled1">.${secondClassName}[pcsp]{color:red;}</style>`,
      )
    })
    it('can write css content from all <script>, <style> and <template> tags', async () => {
      const transformContext = usePinceauTransformContext(
        '<template><div :styled="{ backgroundColor: \'red\' }">Hello World<a :styled="{ color: \'red\' }">Test link</a></div></template>\n'
        + '<script>const testStyled = styled({ backgroundColor: \'red\' })</script>\n'
        + '<script setup>const testStyledSetup = styled({ backgroundColor: \'red\' })</script>\n'
        + '<style transformed>css({ div: { backgroundColor: \'red\' } })\ncss({ div: { backgroundColor: \'green\' } })</style>',
        { ...baseQuery, transformed: true },
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        templates: [
          transformWriteStyleFeatures,
        ],
        scripts: [
          transformWriteStyleFeatures,
          transformWriteScriptFeatures,
        ],
        styles: [
          transformWriteStyleFeatures,
        ],
      })

      try {
        await transformContext.transform()
      }
      catch (e) {
        console.log(e)
      }

      const className = transformContext.state.styleFunctions?.template0_styled0?.className
      const secondClassName = transformContext.state.styleFunctions?.template0_styled1?.className
      const thirdClassName = transformContext.state.styleFunctions?.script0_styled0?.className
      const fourthClassName = transformContext.state.styleFunctions?.script1_styled0?.className
      const fifthCssFunction = transformContext.state.styleFunctions?.style0_css0
      const sixthCssFunction = transformContext.state.styleFunctions?.style0_css1

      expect(transformContext.result()?.code).toBe(
        `<template><div class="${className}" pcsp>Hello World<a class="${secondClassName}" pcsp>Test link</a></div></template>\n`
        + `<script>const testStyled = \`${thirdClassName}\`</script>\n`
        + `<script setup>const testStyledSetup = \`${fourthClassName}\`</script>\n`
        + `<style transformed>/* ${fifthCssFunction?.pointer} */\n/* ${sixthCssFunction?.pointer} */\ndiv{background-color:red;}\n\ndiv{background-color:green;}\n</style>\n`
        + `<style scoped pc-fn="template0_styled0">.${className}[pcsp]{background-color:red;}</style>\n`
        + `<style scoped pc-fn="template0_styled1">.${secondClassName}[pcsp]{color:red;}</style>\n`
        + `<style scoped pc-fn="script0_styled0">.${thirdClassName}{background-color:red;}</style>\n`
        + `<style scoped pc-fn="script1_styled0">.${fourthClassName}{background-color:red;}</style>`,
      )
    })
  })
})
