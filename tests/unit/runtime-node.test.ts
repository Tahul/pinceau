import { computedStylesToDeclaration, getSSRStylesheet, variantsToDeclaration } from '@pinceau/runtime'
import type { ComputedStyleDefinition } from '@pinceau/style'
import { beforeEach, describe, expect, it } from 'vitest'

describe('@pinceau/runtime', () => {
  describe('utils/computed-styles.ts', () => {
    it('should handle raw values correctly', () => {
      const input = [
        ['--pc-variable', 'red'],
        ['--pc-variable2', 'blue'],
      ] as [string, ReturnType<ComputedStyleDefinition>][]

      const output = computedStylesToDeclaration(input)

      expect(output).toEqual({
        '--pc-variable': 'red',
        '--pc-variable2': 'blue',
      })
    })

    it('should handle object values correctly including media queries', () => {
      const input = [
        ['--pc-variable', { $initial: 'red', $mq1: 'green' }],
        ['--pc-variable2', 'blue'],
      ] as [string, ReturnType<ComputedStyleDefinition>][]

      const output = computedStylesToDeclaration(input)

      expect(output).toEqual({
        '--pc-variable': 'red',
        '$mq1': {
          '--pc-variable': 'green',
        },
        '--pc-variable2': 'blue',
      })
    })

    it('should handle undefined computedStyles gracefully', () => {
      const output = computedStylesToDeclaration(undefined)

      expect(output).toEqual({})
    })

    it('should handle empty arrays correctly', () => {
      const output = computedStylesToDeclaration([])

      expect(output).toEqual({})
    })

    it('should handle mixed raw and object values correctly', () => {
      const input = [
        ['--pc-variable1', 'red'],
        ['--pc-variable2', { $initial: 'blue', $mq1: 'green' }],
      ] as [string, ReturnType<ComputedStyleDefinition>][]

      const output = computedStylesToDeclaration(input)

      expect(output).toEqual({
        '--pc-variable1': 'red',
        '--pc-variable2': 'blue',
        '$mq1': {
          '--pc-variable2': 'green',
        },
      })
    })
  })

  describe('utils/sheet.ts', () => {
    let ssrStylesheet: CSSStyleSheet

    beforeEach(() => {
      ssrStylesheet = getSSRStylesheet()
    })

    it('should correctly insert a rule with specified index', () => {
      ssrStylesheet.insertRule('body { background-color: red; }', 0)
      expect(ssrStylesheet.cssRules[0]).toEqual({ cssText: 'body { background-color: red; }' })
    })

    it('should correctly insert a rule without a specified index', () => {
      ssrStylesheet.insertRule('body { background-color: red; }')
      expect(ssrStylesheet.cssRules[0]).toEqual({ cssText: 'body { background-color: red; }' })

      ssrStylesheet.insertRule('div { color: blue; }')
      expect(ssrStylesheet.cssRules[1]).toEqual({ cssText: 'div { color: blue; }' })
    })

    it('should correctly delete a rule', () => {
      ssrStylesheet.insertRule('body { background-color: red; }')
      ssrStylesheet.insertRule('div { color: blue; }')

      ssrStylesheet.deleteRule(0)
      expect(ssrStylesheet.cssRules[0]).toBeUndefined()
    })

    it('should correctly handle inserting a rule at a negative index', () => {
      expect(() => ssrStylesheet.insertRule('body { background-color: red; }', -1)).toThrow()
    })

    it('should correctly handle deleting a rule at a negative index', () => {
      expect(() => ssrStylesheet.deleteRule(-1)).toThrow()
    })

    it('should correctly handle inserting a rule at an index greater than the length of cssRules', () => {
      expect(() => ssrStylesheet.insertRule('body { background-color: red; }', 1)).toThrow()
    })

    it('should correctly handle deleting a rule at an index greater than the length of cssRules', () => {
      expect(() => ssrStylesheet.deleteRule(1)).toThrow()
    })
  })

  describe('utils/variants.ts', () => {
    const variants = {
      size: {
        sm: {
          span: {
            padding: '{space.3} {space.6}',
          },
        },
        md: {
          span: {
            padding: '{space.6} {space.8}',
          },
        },
        lg: {
          span: {
            padding: '{space.8} {space.12}',
          },
        },
        xl: {
          span: {
            padding: '{space.12} {space.24}',
          },
        },
      },
    }

    it('should process simple variant props correctly', () => {
      const variantProps = {
        size: 'sm',
      }

      const { classes, declaration } = variantsToDeclaration(variants, variantProps)

      expect(classes).toEqual([])
      expect(declaration).toEqual({
        span: {
          padding: '{space.3} {space.6}',
        },
      })
    })

    it('should process variant props with media queries correctly', () => {
      const variantProps = {
        size: {
          $initial: 'md',
          $mq1: 'lg',
        },
      }

      const { classes, declaration } = variantsToDeclaration(variants, variantProps)

      expect(classes).toEqual([])
      expect(declaration).toEqual({
        span: {
          padding: '{space.6} {space.8}',
        },
        $mq1: {
          span: {
            padding: '{space.8} {space.12}',
          },
        },
      })
    })

    it('should process variant props with $class property correctly', () => {
      const variantsWithClass = {
        ...variants,
        size: {
          ...variants.size,
          sm: {
            $class: 'sm-class',
            span: {
              padding: '{space.3} {space.6}',
            },
          },
        },
      }

      const variantProps = {
        size: 'sm',
      }

      const { classes, declaration } = variantsToDeclaration(variantsWithClass, variantProps)

      expect(classes).toEqual(['sm-class'])
      expect(declaration).toEqual({
        span: {
          padding: '{space.3} {space.6}',
        },
      })
    })

    it('should handle array type variant values correctly', () => {
      const variantsWithArray = {
        ...variants,
        size: {
          ...variants.size,
          sm: [
            'array-class1',
            'array-class2',
          ],
        },
      }

      const variantProps = {
        size: 'sm',
      }

      const { classes, declaration } = variantsToDeclaration(variantsWithArray, variantProps)

      expect(classes).toEqual(['array-class1', 'array-class2'])
      expect(declaration).toEqual({})
    })

    it('should handle non-existent variant props gracefully', () => {
      const variantProps = {
        size: 'nonexistent',
      }

      const { classes, declaration } = variantsToDeclaration(variants, variantProps)

      expect(classes).toEqual([])
      expect(declaration).toEqual({})
    })

    it('should process multiple variant props correctly', () => {
      const variantProps = {
        size: 'sm',
        anotherProp: 'value',
      }

      const { classes, declaration } = variantsToDeclaration(
        {
          ...variants,
          anotherProp: {
            value: {
              $class: 'another-class',
            },
          },
        },
        variantProps,
      )

      expect(classes).toEqual(['another-class'])
      expect(declaration).toEqual({
        span: {
          padding: '{space.3} {space.6}',
        },
      })
    })

    it('should handle invalid variant props gracefully', () => {
      const variantProps = {
        size: undefined,
      }

      const { classes, declaration } = variantsToDeclaration(variants, variantProps as any)

      expect(classes).toEqual([])
      expect(declaration).toEqual({})
    })

    it('should handle null variant props gracefully', () => {
      const variantProps = {
        size: null,
      }

      const { classes, declaration } = variantsToDeclaration(variants, variantProps as any)

      expect(classes).toEqual([])
      expect(declaration).toEqual({})
    })

    it('should handle empty variant props gracefully', () => {
      const variantProps = {}

      const { classes, declaration } = variantsToDeclaration(variants, variantProps)

      expect(classes).toEqual([])
      expect(declaration).toEqual({})
    })
  })
})
