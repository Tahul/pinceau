import fs from 'node:fs'
import type { PinceauContext, PinceauQuery } from '@pinceau/core'
import { load, normalizeOptions, parsePinceauQuery, usePinceauContext, usePinceauTransformContext } from '@pinceau/core/utils'
import { PinceauVueTransformer, hasRuntimeStyling, registerVirtualOutputs } from '@pinceau/vue/utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { transformAddPinceauClass, transformComputedStyles, transformWriteStyleFeatures, suite as vueTransformSuite } from '@pinceau/vue/transforms'
import { suite as styleTransformSuite } from '@pinceau/style/transforms'
import { paletteLayer, resolveFixtures, resolveTmp } from './utils'

describe('@pinceau/vue', () => {
  describe('utils/has-runtime.ts', () => {
    let pinceauContext: PinceauContext
    const baseQuery = parsePinceauQuery(resolveFixtures('./components/TestBase.vue'))
    const computedStylesQuery = parsePinceauQuery(resolveFixtures('./components/TestComputedStyle.vue'))

    beforeEach(async () => {
      pinceauContext = usePinceauContext()
      pinceauContext.registerTransformer('vue', PinceauVueTransformer)
    })

    it('do not find runtime parts in a base transform context', () => {
      pinceauContext.addTransformed(baseQuery.filename, baseQuery)

      const code = load(baseQuery.filename, pinceauContext)

      const transformContext = usePinceauTransformContext(
        code,
        baseQuery,
        pinceauContext,
      )

      transformContext.registerTransforms(vueTransformSuite)

      transformContext.transform()

      expect(hasRuntimeStyling(transformContext)).toBe(false)

      delete pinceauContext.transformed[baseQuery.filename]
    })
    it('can find runtime parts in a base transform context', () => {
      pinceauContext.addTransformed(computedStylesQuery.filename, computedStylesQuery)

      const code = load(computedStylesQuery.filename, pinceauContext)

      const transformContext = usePinceauTransformContext(
        code,
        computedStylesQuery,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms(vueTransformSuite)

      transformContext.transform()

      expect(hasRuntimeStyling(transformContext)).toBe(true)

      delete pinceauContext.transformed[baseQuery.filename]
    })
  })

  describe('utils/load.ts', () => {
    let pinceauContext: PinceauContext
    const baseQuery = parsePinceauQuery(resolveFixtures('./components/TestBase.vue'))

    beforeEach(async () => {
      const options = normalizeOptions()
      options.theme.layers.push(paletteLayer)
      pinceauContext = usePinceauContext(options)
      pinceauContext.registerTransformer('vue', PinceauVueTransformer)
    })

    it('can load style blocks', () => {
      const styleQuery: PinceauQuery = { ...baseQuery, type: 'style', index: 0 }

      pinceauContext.addTransformed(styleQuery.filename, styleQuery)

      const code = load(styleQuery.filename, pinceauContext)

      expect(code).toBe(`
.test-base {
  font-size: 16px;
}
`)
    })
    it('can load template block', () => {
      const templateQuery: PinceauQuery = { ...baseQuery, type: 'template' }

      pinceauContext.addTransformed(templateQuery.filename, templateQuery)

      const code = load(templateQuery.filename, pinceauContext)

      expect(code).toBe(`
  <div class="test-base">Basic Vue component</div>
`)
    })
    it('can load script block', () => {
      const scriptQuery: PinceauQuery = { ...baseQuery, type: 'script' }

      pinceauContext.addTransformed(scriptQuery.filename, scriptQuery)

      const code = load(scriptQuery.filename, pinceauContext)

      expect(code).toBe(`
export const test = 'hello world'
`)
    })
    it('can load script setup block', () => {
      const scriptSetupQuery: PinceauQuery = { ...baseQuery, type: 'script', setup: true }

      pinceauContext.addTransformed(scriptSetupQuery.filename, scriptSetupQuery)

      const code = load(scriptSetupQuery.filename, pinceauContext)

      expect(code).toBe(`
console.log('hello world')
`)
    })
  })

  /*
  describe('utils/runtime-exports.ts', () => {
  })
  describe('utils/runtime-plugin.ts', () => {
  })
  */

  describe('utils/transformer.ts', () => {
    it('transformer to be complete', () => {
      // Each of transformer parts are tested independently
      expect(PinceauVueTransformer.MagicSFC).toBeDefined()
      expect(PinceauVueTransformer.loadBlock).toBeDefined()
      expect(PinceauVueTransformer.loadTransformers?.length).toBeGreaterThan(0)
      expect(PinceauVueTransformer.parser).toBeDefined()
    })
  })

  describe('utils/virtual.ts', () => {
    let pinceauContext: PinceauContext

    beforeEach(async () => {
      pinceauContext = usePinceauContext()
    })

    it('registers and write vue virtual outputs', () => {
      vi.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => { })

      pinceauContext.options.theme.buildDir = resolveTmp()

      registerVirtualOutputs(pinceauContext)

      expect(fs.writeFileSync).toHaveBeenCalledTimes(2)
      expect(pinceauContext.getOutputId('/__pinceau_runtime.ts')).toBe('$pinceau')
      expect(pinceauContext.getOutputId('/__pinceau_vue_plugin.ts')).toBe('$pinceau/vue-plugin')
    })
  })

  describe('transforms/add-class.ts', () => {
    let pinceauContext: PinceauContext
    const variantsQuery = parsePinceauQuery(resolveFixtures('./components/TestVariants.vue'))

    beforeEach(async () => {
      pinceauContext = usePinceauContext()
      pinceauContext.registerTransformer('vue', PinceauVueTransformer)
    })

    it('adds class to root element of a template', () => {
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

      transformContext.transform()

      expect(transformContext.result()?.code).toStrictEqual(
        '<template>'
        + '<div class="test-variants" :class="[$pinceau]">Variants component</div>'
        + '</template>')
    })
    it('adds class to all root elements of a template', () => {
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

      transformContext.transform()

      expect(transformContext.result()?.code).toStrictEqual(
        '<template>'
        + '<div class="test-variants" :class="[$pinceau]">Variants component</div>'
        + '<div :class="[$pinceau]"><section><button type="button">Hello World</button></section></div>'
        + '</template>',
      )
    })
    it('adds class to existing :class attribute (object)', () => {
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

      transformContext.transform()

      expect(transformContext.result()?.code).toStrictEqual(
        '<template>'
        + '<div :class="[{ \'test-variants\': true }, $pinceau]">Variants component</div>'
        + '<div :class="[$pinceau]"><section><button type="button">Hello World</button></section></div>'
        + '</template>',
      )
    })
    it('adds class to existing :class attribute (array)', () => {
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

      transformContext.transform()

      expect(transformContext.result()?.code).toStrictEqual(
        '<template>'
        + '<div :class="[\'test-variants\', $pinceau]">Variants component</div>'
        + '<div :class="[$pinceau]"><section><button type="button">Hello World</button></section></div>'
        + '</template>',
      )
    })
    it('adds class to existing :class attribute (string)', () => {
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

      transformContext.transform()

      expect(transformContext.result()?.code).toStrictEqual(
        '<template>'
        + '<div :class="[\'test-variants\', $pinceau]">Variants component</div>'
        + '<div :class="[$pinceau]"><section><button type="button">Hello World</button></section></div>'
        + '</template>',
      )
    })
  })

  describe('transforms/computed-styles.ts', () => {
    let pinceauContext: PinceauContext
    const computedStylesQuery = parsePinceauQuery(resolveFixtures('./components/TestComputedStyle.vue'))

    beforeEach(async () => {
      pinceauContext = usePinceauContext()
      pinceauContext.registerTransformer('vue', PinceauVueTransformer)
    })

    it('adds computed styles to the component', () => {
      pinceauContext.addTransformed(computedStylesQuery.filename, computedStylesQuery)

      const code = load(computedStylesQuery.filename, pinceauContext)

      const transformContext = usePinceauTransformContext(
        code,
        computedStylesQuery,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        scripts: [
          transformComputedStyles,
        ],
      })

      transformContext.transform()

      const computedStyle = transformContext?.state?.styleFunctions?.style0_css0?.computedStyles?.[0]

      expect(computedStyle).toBeDefined()
      expect(transformContext.result()?.code).toContain(`useComputedStyle(\'${computedStyle?.variable}\', ${computedStyle?.compiled}`)
    })
  })

  describe('transforms/runtime-setup.ts', () => {
    it('true', () => expect(true).toBe(true))
  })

  describe('transforms/style-lang-ts.ts', () => {
    it('true', () => expect(true).toBe(true))
  })

  describe('transforms/variants.ts', () => {
    it('true', () => expect(true).toBe(true))
  })

  describe('transforms/write-style-features.ts', () => {
    let pinceauContext: PinceauContext
    const baseQuery = parsePinceauQuery(resolveFixtures('./components/TestBase.vue'))

    beforeEach(async () => {
      pinceauContext = usePinceauContext()
      pinceauContext.registerTransformer('vue', PinceauVueTransformer)
    })

    it('can write css content from <script> css() function', () => {
      const transformContext = usePinceauTransformContext(
        '<script>css({ div: { backgroundColor: \'red\' } })</script>',
        baseQuery,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        scripts: [
          transformWriteStyleFeatures,
        ],
      })

      transformContext.transform()

      expect(transformContext.result()?.code).toBe(
        '<script></script>\n'
        + '<style scoped pinceau-style-function="script0_css0">div{background-color:red;}</style>',
      )
    })
    it('can write css content from <script> styled() function', () => {
      const transformContext = usePinceauTransformContext(
        '<script>const testStyled = styled({ backgroundColor: \'red\' })</script>',
        baseQuery,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        scripts: [
          transformWriteStyleFeatures,
        ],
      })

      transformContext.transform()

      const className = transformContext.state.styleFunctions?.script0_styled0?.className

      expect(transformContext.result()?.code).toBe(
        `<script>const testStyled = \`${className}\`</script>\n`
        + `<style scoped pinceau-style-function="script0_styled0">.${className}{background-color:red;}</style>`,
      )
    })
    it('can write css pointer from <style> styled() function', () => {
      const transformContext = usePinceauTransformContext(
        '<style lang="postcss" transformed>styled({ backgroundColor: \'red\' })</style>',
        { ...baseQuery, transformed: true },
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        styles: [
          transformWriteStyleFeatures,
        ],
      })

      transformContext.transform()

      const styleFunction = transformContext.state.styleFunctions?.style0_styled0

      expect(transformContext.result()?.code).toBe(`<style lang="postcss" transformed>${styleFunction?.pointer}\n.${styleFunction?.className}{background-color:red;}\n</style>`)
    })
    it('can write css content from <style> css() function', () => {
      const transformContext = usePinceauTransformContext(
        '<style lang="postcss" transformed>css({ div: { backgroundColor: \'red\' } })</style>',
        { ...baseQuery, transformed: true },
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        styles: [
          transformWriteStyleFeatures,
        ],
      })

      transformContext.transform()

      const styleFunction = transformContext.state.styleFunctions?.style0_css0

      expect(transformContext.result()?.code).toBe(`<style lang="postcss" transformed>${styleFunction?.pointer}\ndiv{background-color:red;}\n</style>`)
    })
    it('can write css pointers from multiple <style> css() function', () => {
      const transformContext = usePinceauTransformContext(
        '<style lang="postcss" transformed>css({ div: { backgroundColor: \'red\' } })</style>\n'
        + '<style lang="postcss" transformed>css({ button: { backgroundColor: \'blue\' } })</style>',
        { ...baseQuery, transformed: true },
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        styles: [
          transformWriteStyleFeatures,
        ],
      })

      transformContext.transform()

      const firstStyleFunction = transformContext.state.styleFunctions?.style0_css0
      const secondStyleFunction = transformContext.state.styleFunctions?.style1_css0

      expect(transformContext.result()?.code).toBe(
        `<style lang="postcss" transformed>${firstStyleFunction?.pointer}\ndiv{background-color:red;}\n</style>\n`
        + `<style lang="postcss" transformed>${secondStyleFunction?.pointer}\nbutton{background-color:blue;}\n</style>`,
      )
    })
    it('can write css contents from multiple <style> css() function on vueQuery', () => {
      const transformContext = usePinceauTransformContext(
        '<style lang="postcss" transformed>css({ div: { backgroundColor: \'red\' } })</style>\n'
        + '<style lang="postcss" transformed>css({ button: { backgroundColor: \'blue\' } })</style>',
        { ...baseQuery, transformed: true, vueQuery: true },
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms({
        styles: [
          transformWriteStyleFeatures,
        ],
      })

      transformContext.transform()

      const firstStyleFunction = transformContext.state.styleFunctions?.style0_css0
      const secondStyleFunction = transformContext.state.styleFunctions?.style1_css0

      expect(transformContext.result()?.code).toBe(
        `<style lang="postcss" transformed>${firstStyleFunction?.pointer}\ndiv{background-color:red;}\n</style>\n`
        + `<style lang="postcss" transformed>${secondStyleFunction?.pointer}\nbutton{background-color:blue;}\n</style>`,
      )
    })
    it('can write css content from <template> styled prop', () => {
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

      transformContext.transform()

      const className = transformContext.state.styleFunctions?.template0_styled0?.className

      expect(transformContext.result()?.code).toBe(
        `<template><div class="${className}">Hello World</div></template>\n`
        + `<style scoped pinceau-style-function="template0_styled0">.${className}{background-color:red;}</style>`,
      )
    })
    it('can write css content from multiple <template> styled prop', () => {
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

      transformContext.transform()

      const className = transformContext.state.styleFunctions?.template0_styled0?.className
      const secondClassName = transformContext.state.styleFunctions?.template0_styled1?.className

      expect(transformContext.result()?.code).toBe(
        `<template><div class="${className}">Hello World<a class="${secondClassName}">Test link</a></div></template>\n`
        + `<style scoped pinceau-style-function="template0_styled0">.${className}{background-color:red;}</style>\n`
        + `<style scoped pinceau-style-function="template0_styled1">.${secondClassName}{color:red;}</style>`,
      )
    })
    it('can write css content from all <script>, <style> and <template> tags', () => {
      const transformContext = usePinceauTransformContext(
        '<template><div :styled="{ backgroundColor: \'red\' }">Hello World<a :styled="{ color: \'red\' }">Test link</a></div></template>\n'
        + '<script>const testStyled = styled({ backgroundColor: \'red\' })</script>\n'
        + '<script setup>const testStyledSetup = styled({ backgroundColor: \'red\' })</script>\n'
        + '<style lang="postcss" transformed>css({ div: { backgroundColor: \'red\' } })\ncss({ div: { backgroundColor: \'green\' } })</style>',
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
        ],
        styles: [
          transformWriteStyleFeatures,
        ],
      })

      transformContext.transform()

      const className = transformContext.state.styleFunctions?.template0_styled0?.className
      const secondClassName = transformContext.state.styleFunctions?.template0_styled1?.className
      const thirdClassName = transformContext.state.styleFunctions?.script0_styled0?.className
      const fourthClassName = transformContext.state.styleFunctions?.script1_styled0?.className
      const fifthCssFunction = transformContext.state.styleFunctions?.style0_css0
      const sixthCssFunction = transformContext.state.styleFunctions?.style0_css1

      console.log({ fifthCssFunction, sixthCssFunction })

      expect(transformContext.result()?.code).toBe(
        `<template><div class="${className}">Hello World<a class="${secondClassName}">Test link</a></div></template>\n`
        + `<script>const testStyled = \`${thirdClassName}\`</script>\n`
        + `<script setup>const testStyledSetup = \`${fourthClassName}\`</script>\n`
        + `<style lang="postcss" transformed>${fifthCssFunction?.pointer}\n${sixthCssFunction?.pointer}\ndiv{background-color:red;}\n\ndiv{background-color:green;}\n</style>\n`
        + `<style scoped pinceau-style-function="template0_styled0">.${className}{background-color:red;}</style>\n`
        + `<style scoped pinceau-style-function="template0_styled1">.${secondClassName}{color:red;}</style>\n`
        + `<style scoped pinceau-style-function="script0_styled0">.${thirdClassName}{background-color:red;}</style>\n`
        + `<style scoped pinceau-style-function="script1_styled0">.${fourthClassName}{background-color:red;}</style>`,
      )
    })
  })
})
