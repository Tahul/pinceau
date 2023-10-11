import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { kebabCase } from 'scule'
import { findCallees, load, parseAst, parsePinceauQuery, usePinceauContext, usePinceauTransformContext } from '@pinceau/core/utils'
import { hasRuntimeStyling, resolveStyleFunctionContext } from '@pinceau/style/utils'
import type { PinceauContext } from '@pinceau/core'
import type { PinceauConfigContext } from '@pinceau/theme'
import { PinceauVueTransformer } from '@pinceau/vue/utils'
import { setupThemeFormats, usePinceauConfigContext } from '@pinceau/theme/utils'
import { suite as styleTransformSuite, transformStyleFunctions, transformStyledProps } from '@pinceau/style/transforms'
import { suite as vueTransformSuite } from '@pinceau/vue/transforms'
import { resolveFixtures, resolveTmp, testFileLayer } from '../utils'

describe('@pinceau/style', () => {
  describe('utils/css-function-context.ts', () => {
    let pinceauContext: PinceauContext

    beforeAll(() => {
      pinceauContext = usePinceauContext()
    })

    it('should return a valid css function context object', async () => {
      const code = 'css({ div: { color: \'red\' } })'
      const query = parsePinceauQuery(resolveTmp('./components/css-function.ts'))
      const cssFunctions = findCallees(parseAst(code), 'css')
      const transformContext = usePinceauTransformContext(code, query, pinceauContext)
      const result = await resolveStyleFunctionContext(transformContext, pinceauContext, cssFunctions[0], 0)

      expect(result).toBeDefined()
      if (!result) { throw new Error('No css function context result!') }
      expect(result.css).toBe('div{color:red;}')
      expect(result.arg.type).toBe('ObjectExpression')
      expect(result.declaration.div.color).toBe('red')
    })
    it('should resolve variants', async () => {
      const code = 'css({ variants: { size: { sm: { padding: \'1rem\' }, md: { padding: \'2rem\' }, lg: { padding: \'3rem\' } } } })'
      const query = parsePinceauQuery(resolveTmp('./components/css-function.ts'))
      const cssFunctions = findCallees(parseAst(code), 'css')
      const transformContext = usePinceauTransformContext(code, query, pinceauContext)
      const result = await resolveStyleFunctionContext(transformContext, pinceauContext, cssFunctions[0], 0)

      expect(result).toBeDefined()
      if (!result) { throw new Error('No css function context result!') }
      expect(result.variants.size).toBeDefined()
      expect(Object.keys(result.variants.size)).toEqual(['sm', 'md', 'lg'])
    })
    it('should resolve computed styles', async () => {
      const code = 'css({ div: { color: () => props.color, backgroundColor: () => props.backgroundColor } })'
      const query = parsePinceauQuery(resolveTmp('./components/css-function.ts'))
      const cssFunctions = findCallees(parseAst(code), 'css')
      const transformContext = usePinceauTransformContext(code, query, pinceauContext)
      const result = await resolveStyleFunctionContext(transformContext, pinceauContext, cssFunctions[0], 0)

      expect(result).toBeDefined()
      if (!result) { throw new Error('No css function context result!') }
      expect(result.computedStyles).toBeDefined()
      expect(Object.keys(result.computedStyles).length).toBe(2)
      expect(result.computedStyles[0].id.startsWith('pcs') && result.computedStyles[0].id.endsWith('color')).toBe(true)
      expect(result.computedStyles[1].id.startsWith('pcs') && result.computedStyles[1].id.endsWith('backgroundColor')).toBe(true)
      expect(result.computedStyles[0].compiled).toEqual('() => props.color')
      expect(result.computedStyles[1].compiled).toEqual('() => props.backgroundColor')
      expect(result.computedStyles[0].variable).toEqual(`--${kebabCase(result.computedStyles[0].id)}`)
      expect(result.computedStyles[1].variable).toEqual(`--${kebabCase(result.computedStyles[1].id)}`)
      expect(result.computedStyles[0].ast.type).toEqual('MemberExpression')
      expect(result.computedStyles[0].ast.loc.start).toEqual({ column: 26, index: 26, line: 1 })
      expect(result.computedStyles[0].ast.loc.end).toEqual({ column: 37, index: 37, line: 1 })
      expect(result.computedStyles[1].ast.loc.start).toEqual({ column: 62, index: 62, line: 1 })
      expect(result.computedStyles[1].ast.loc.end).toEqual({ column: 83, index: 83, line: 1 })
    })
    it('should resolve declaration', async () => {
      const code = 'css({ div: { color: \'red\' } })'
      const query = parsePinceauQuery(resolveTmp('./components/css-function.ts'))
      const cssFunctions = findCallees(parseAst(code), 'css')
      const transformContext = usePinceauTransformContext(code, query, pinceauContext)
      const result = await resolveStyleFunctionContext(transformContext, pinceauContext, cssFunctions[0], 0)

      expect(result).toBeDefined()
      if (!result) { throw new Error('No css function context result!') }
      expect(result.declaration.div.color).toEqual('red')
    })
    it('should resolve localTokens in $token format', async () => {
      // eslint-disable-next-line no-template-curly-in-string
      const code = 'css({ div: { \'$test.token\': \'blue\', button: { \'$nested.local.token\': () => \`$color.green.${props.color}\` } } })'
      const query = parsePinceauQuery(resolveTmp('./components/css-function.ts'))
      const cssFunctions = findCallees(parseAst(code), 'css')
      const transformContext = usePinceauTransformContext(code, query, pinceauContext)
      const result = await resolveStyleFunctionContext(transformContext, pinceauContext, cssFunctions[0], 0)

      expect(result).toBeDefined()
      if (!result) { throw new Error('No css function context result!') }
      expect(result.localTokens['$test.token'].type).toBe('StringLiteral')
      expect(result.localTokens['$test.token'].value).toBe('blue')
      expect(result.localTokens['$nested.local.token'].type).toBe('ArrowFunctionExpression')
    })
  })

  describe('transforms/style-functions.ts', () => {
    const typescriptQuery = parsePinceauQuery(resolveFixtures('./components/theme-helper.ts'))
    const vueQuery = parsePinceauQuery(resolveFixtures('./components/vue/TestBase.vue'))
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

    it('should parse css function in typescript', async () => {
      const transformContext = usePinceauTransformContext(
        'css({ div: { color: \'red\' } })',
        typescriptQuery,
        pinceauContext,
      )

      transformContext.registerTransforms({
        scripts: [transformStyleFunctions],
      })

      await transformContext.transform()

      expect(transformContext.state?.styleFunctions?.script0_css0).toBeDefined()
    })
    it('should parse css functions in script blocks', async () => {
      const transformContext = usePinceauTransformContext(
        '<script lang="ts">const cssClass = css({ backgroundColor: \'red\' })</script>',
        vueQuery,
        pinceauContext,
      )

      transformContext.registerTransforms({
        scripts: [transformStyleFunctions],
      })

      await transformContext.transform()

      expect(transformContext.state?.styleFunctions?.script0_css0).toBeDefined()
    })
    it('should parse css functions script blocks', async () => {
      const transformContext = usePinceauTransformContext(
        '<script lang="ts">css({ backgroundColor: \'red\' })</script>',
        vueQuery,
        pinceauContext,
      )

      transformContext.registerTransforms({
        scripts: [transformStyleFunctions],
      })

      await transformContext.transform()

      expect(transformContext.state?.styleFunctions?.script0_css0).toBeDefined()
    })
    it('should parse css functions style blocks', async () => {
      const transformContext = usePinceauTransformContext(
        '<style lang="ts">css({ div: { backgroundColor: \'red\' } })</style>',
        vueQuery,
        pinceauContext,
      )

      transformContext.registerTransforms({
        styles: [transformStyleFunctions],
      })

      await transformContext.transform()

      expect(transformContext?.state?.styleFunctions?.style0_css0).toBeDefined()
    })
    it('should parse styled functions in script blocks', async () => {
      const transformContext = usePinceauTransformContext(
        '<script lang="ts">const cssClass = styled({ backgroundColor: \'red\' })</script>',
        vueQuery,
        pinceauContext,
      )

      transformContext.registerTransforms({
        scripts: [transformStyleFunctions],
      })

      await transformContext.transform()

      expect(transformContext.state.styleFunctions?.script0_styled0).toBeDefined()
    })
    it('should parse styled content in script blocks', async () => {
      const transformContext = usePinceauTransformContext(
        '<script lang="ts">const cssClass = styled({ backgroundColor: \'red\' })</script>',
        vueQuery,
        pinceauContext,
      )

      transformContext.registerTransforms({
        scripts: [transformStyleFunctions],
      })

      await transformContext.transform()

      expect(transformContext.result()).toBeUndefined()
      expect(transformContext.state?.styleFunctions?.script0_styled0).toBeDefined()
    })
    it('should replace styled content with pointer comment in style blocks', async () => {
      const transformContext = usePinceauTransformContext(
        '<style lang="ts">styled({ div: { backgroundColor: \'red\' } })</style>',
        vueQuery,
        pinceauContext,
      )

      transformContext.registerTransforms({
        styles: [transformStyleFunctions],
      })

      await transformContext.transform()

      expect(transformContext.result()?.code).toStrictEqual(`<style lang="ts">/* $pinceau:${transformContext.query.filename}:style0_styled0 */</style>`)
    })
  })

  describe('transforms/styled-props.ts', () => {
    const vueQuery = parsePinceauQuery(resolveFixtures('./components/vue/TestBase.vue'))
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

    it('should replace styled prop by class in template blocks', async () => {
      const transformContext = usePinceauTransformContext(
        '<template><div styled="{ backgroundColor: \'red\' }"><a :styled="{ color: \'blue\' }">Hello World</a></div></template>',
        vueQuery,
        pinceauContext,
      )

      transformContext.registerTransforms({
        templates: [
          transformStyledProps,
        ],
      })

      await transformContext.transform()

      const firstClassName = transformContext.state?.styleFunctions?.template0_styled0?.className
      const secondClassName = transformContext.state?.styleFunctions?.template0_styled1?.className

      expect(transformContext.result()?.code).toStrictEqual(`<template><div class="${firstClassName}" pcsp><a class="${secondClassName}" pcsp>Hello World</a></div></template>`)
    })
  })

  describe('utils/has-runtime.ts', () => {
    let pinceauContext: PinceauContext
    const baseQuery = parsePinceauQuery(resolveFixtures('./components/vue/TestBase.vue'))
    const computedStylesQuery = parsePinceauQuery(resolveFixtures('./components/vue/TestComputedStyle.vue'))

    beforeEach(async () => {
      pinceauContext = usePinceauContext()
      pinceauContext.registerTransformer('vue', PinceauVueTransformer)
    })

    it('do not find runtime parts in a base transform context', async () => {
      pinceauContext.addTransformed(baseQuery.filename, baseQuery)

      const code = await load(baseQuery.filename, pinceauContext)

      const transformContext = usePinceauTransformContext(
        code,
        baseQuery,
        pinceauContext,
      )

      transformContext.registerTransforms(vueTransformSuite)

      await transformContext.transform()

      expect(hasRuntimeStyling(transformContext)).toBe(false)

      delete pinceauContext.transformed[baseQuery.filename]
    })
    it('can find runtime parts in a base transform context', async () => {
      pinceauContext.addTransformed(computedStylesQuery.filename, computedStylesQuery)

      const code = await load(computedStylesQuery.filename, pinceauContext)

      const transformContext = usePinceauTransformContext(
        code,
        computedStylesQuery,
        pinceauContext,
      )

      transformContext.registerTransforms(styleTransformSuite)
      transformContext.registerTransforms(vueTransformSuite)

      await transformContext.transform()

      expect(hasRuntimeStyling(transformContext)).toBe(true)

      delete pinceauContext.transformed[baseQuery.filename]
    })
  })
})
