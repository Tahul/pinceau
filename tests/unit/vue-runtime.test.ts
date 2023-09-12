/**
 * @vitest-environment jsdom
 */

import { computed, defineComponent, ref } from 'vue'
import { mount as mountNative } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { PinceauRuntimeSheet, PinceauThemeSheet } from '@pinceau/runtime'
import {
  useRuntimeSheet as _useRuntimeSheet,
  useThemeSheet as _useThemeSheet,
} from '@pinceau/runtime'
import {
  responsiveProp,
  useComputedStyles,
  usePinceauRuntime,
  useRuntimeSheet,
  useStyle,
  useThemeSheet,
  useVariants,
} from '@pinceau/vue/runtime'

import type { ThemeTokens } from '@pinceau/style'
import { getRulesFromSheet, getSheetFromComponent, mount, removeSheet } from '../utils'

describe('@pinceau/vue/runtime', () => {
  describe('utils/computed-styles.ts', () => {
    const ComputedStyleComponent = defineComponent({
      props: {
        msg: String,
        color: responsiveProp<keyof PinceauTheme['color']>('red'),
      },
      setup(props) {
        const computedStyleClass = useComputedStyles([
          ['--pc-test', () => props.color],
          ['--pc-test-token', () => `$color.${props.color}.1`],
          ['--pc-test-responsive-token', () => ({ $dark: `$color.${props.color}.1`, $initial: `$color.${props.color}.9` })],
        ])

        return {
          computedStyleClass,
        }
      },
      template: '<p :class="computedStyleClass">{{ msg }}</p>',
    })

    it('should properly mount component with computed styles', () => {
      const component = mount(
        ComputedStyleComponent,
        {
          props: {
            msg: 'Hello world',
          },
        },
      )

      const sheet = getSheetFromComponent(component, 'runtime')

      expect(sheet.cache.size).toBe(1)

      const rules = getRulesFromSheet(sheet)

      expect(rules).toBeDefined()

      const result = sheet.toString()

      // Expect sheet to contain the style for the runtime
      expect(result).toContain('--pc-test: red')
      expect(result).toContain('--pc-test-token: var(--color-red-1')
      expect(result).toContain('--pc-test-responsive-token: var(--color-red-1)')
      expect(result).toContain('--pc-test-responsive-token: var(--color-red-9)')

      // Assert the rendered text of the component
      expect(component.text()).toContain('Hello world')
    })
    it('should properly update style on props changes and drop unused styles', async () => {
      const component = mount(
        ComputedStyleComponent,
        {
          props: {
            msg: 'Hello world',
            color: 'red',
          },
        },
      )

      const sheet = getSheetFromComponent(component, 'runtime')

      expect(sheet.cache.size).toBe(1)

      const rules = getRulesFromSheet(sheet)

      expect(rules).toBeDefined()

      let result = sheet.toString()

      // Expect sheet to contain the style for the runtime
      expect(result).toContain('--pc-test: red')
      expect(result).toContain('--pc-test-token: var(--color-red-1')
      expect(result).toContain('--pc-test-responsive-token: var(--color-red-1)')
      expect(result).toContain('--pc-test-responsive-token: var(--color-red-9)')

      await component.setProps({
        color: 'green',
      })

      // Update result reference
      result = sheet.toString()

      // All styles removed
      expect(result).not.toContain('--pc-test: red')
      expect(result).not.toContain('--pc-test-token: var(--color-red-1')
      expect(result).not.toContain('--pc-test-responsive-token: var(--color-red-1)')
      expect(result).not.toContain('--pc-test-responsive-token: var(--color-red-9)')

      // New styles
      expect(result).toContain('--pc-test: green')
      expect(result).toContain('--pc-test-token: var(--color-green-1')
      expect(result).toContain('--pc-test-responsive-token: var(--color-green-1)')
      expect(result).toContain('--pc-test-responsive-token: var(--color-green-9)')
    })
    it('should properly update style on props changes but preserve shared styles', async () => {
      const component = mount(
        {
          props: {
            msg: String,
            color: responsiveProp<keyof PinceauTheme['color']>('red'),
          },
          components: { ComputedStyleComponent },
          template: `<div>
            <computed-style-component :msg="msg" color="red" />
            <computed-style-component :msg="msg" :color="color" />
          </div>`,
        },
        {
          props: {
            msg: 'Hello world',
          },
        },
      )

      const sheet = getSheetFromComponent(component, 'runtime')

      expect(sheet.cache.size).toBe(1)

      const rules = getRulesFromSheet(sheet)

      expect(rules).toBeDefined()

      let result = sheet.toString()

      // Expect sheet to contain the style for the runtime
      expect(result).toContain('--pc-test: red')
      expect(result).toContain('--pc-test-token: var(--color-red-1')
      expect(result).toContain('--pc-test-responsive-token: var(--color-red-1)')
      expect(result).toContain('--pc-test-responsive-token: var(--color-red-9)')

      // Assert the rendered text of the component
      expect(component.text()).toContain('Hello world')

      await component.setProps({
        color: 'green',
      })

      result = sheet.toString()

      // First component styles
      expect(result).toContain('--pc-test: red')
      expect(result).toContain('--pc-test-token: var(--color-red-1')
      expect(result).toContain('--pc-test-responsive-token: var(--color-red-1)')
      expect(result).toContain('--pc-test-responsive-token: var(--color-red-9)')

      // Second component styles
      expect(result).toContain('--pc-test: green')
      expect(result).toContain('--pc-test-token: var(--color-green-1')
      expect(result).toContain('--pc-test-responsive-token: var(--color-green-1)')
      expect(result).toContain('--pc-test-responsive-token: var(--color-green-9)')
    })
  })
  describe('utils/export.ts', () => {
    it('should access theme sheet from useThemeSheet', () => {
      let themeSheet: PinceauThemeSheet | undefined

      mount(
        {
          setup() {
            themeSheet = useThemeSheet()
          },
          template: '<div></div>',
        },
      )

      if (!themeSheet) { throw new Error('no themeSheet found!') }

      expect(themeSheet).toBeDefined()
      expect(themeSheet.theme).toBeDefined()
      expect(themeSheet.sheet).toBeDefined()
      expect(themeSheet.cache).toBeDefined()
      expect(themeSheet.sheet.cssRules).toBeDefined()
      expect(themeSheet.hydrate).toBeDefined()
      expect(themeSheet.formatToken).toBeDefined()
    })
    it('should access runtime sheet from useThemeSheet', () => {
      let runtimeSheet: PinceauRuntimeSheet | undefined

      mount(
        {
          setup() {
            runtimeSheet = useRuntimeSheet()
          },
          template: '<div></div>',
        },
      )

      if (!runtimeSheet) { throw new Error('no runtimeSheet found!') }

      expect(runtimeSheet).toBeDefined()
      expect(runtimeSheet.sheet).toBeDefined()
      expect(runtimeSheet.cache).toBeDefined()
      expect(runtimeSheet.sheet.cssRules).toBeDefined()
      expect(runtimeSheet.hydrate).toBeDefined()
      expect(runtimeSheet.flush).toBeDefined()
      expect(runtimeSheet.deleteMember).toBeDefined()
      expect(runtimeSheet.toString).toBeDefined()
      expect(runtimeSheet.deleteRule).toBeDefined()
      expect(runtimeSheet.getRule).toBeDefined()
    })
    it('should throw if themeSheet not present', () => {
      removeSheet('pinceau-theme')

      mountNative(
        {
          setup() {
            // Use `@pinceau/runtime` exports to skip global injection.
            expect(() => _useThemeSheet()).toThrow()
          },
          template: '<div>Hello World</div>',
        },
      )
    })
    it('should throw if runtimeSheet not present', () => {
      removeSheet('pinceau-runtime')

      mountNative(
        {
          setup() {
            // Use `@pinceau/runtime` exports to skip global injection.
            expect(() => _useRuntimeSheet()).toThrow()
          },
          template: '<div>Hello World</div>',
        },
      )
    })
  })
  describe('utils/pinceau-runtime.ts', () => {
    const PinceauRuntimeComponent = defineComponent({
      props: {
        msg: String,
        color: responsiveProp<keyof PinceauTheme['color']>('red'),
        size: responsiveProp<'sm' | 'md' | 'lg'>('sm'),
      },
      setup(props) {
        const className = usePinceauRuntime(
          [
            ['--pc-test', () => `$color.${props.color}.1`],
          ],
          {
            size: {
              sm: {
                padding: '1rem',
              },
              md: {
                padding: '2rem',
              },
              lg: {
                padding: '3rem',
              },
            },
          },
          props,
        )

        return {
          className,
        }
      },
      template: '<p :class="className">{{ msg }}</p>',
    })
    it('should properly mount component with usePinceauRuntime composable', () => {
      const component = mount(
        PinceauRuntimeComponent,
        {
          props: {
            color: 'blue',
            size: 'sm',
            msg: 'Hello world',
          },
        },
      )

      const sheet = getSheetFromComponent(component, 'runtime')

      expect(sheet.cache.size).toBe(2)

      const rules = getRulesFromSheet(sheet)

      expect(rules).toBeDefined()

      const result = sheet.toString()

      // Expect sheet to contain the style for the runtime
      expect(result).toContain('--pc-test: var(--color-blue-1);')
      expect(result).toContain('padding: 1rem;')

      // Assert the rendered text of the component
      expect(component.text()).toContain('Hello world')
    })
    it('should properly update style on props changes and drop unused styles', async () => {
      const component = mount(
        PinceauRuntimeComponent,
        {
          props: {
            color: 'blue',
            size: 'sm',
            msg: 'Hello world',
          },
        },
      )

      const sheet = getSheetFromComponent(component, 'runtime')

      expect(sheet.cache.size).toBe(2)

      const rules = getRulesFromSheet(sheet)

      expect(rules).toBeDefined()

      let result = sheet.toString()

      // Expect sheet to contain the style for the runtime
      expect(result).toContain('--pc-test: var(--color-blue-1);')
      expect(result).toContain('padding: 1rem;')

      await component.setProps({
        color: 'green',
        size: 'lg',
      })

      // Update result reference
      result = sheet.toString()

      // Old styles removed
      expect(result).not.toContain('--pc-test: var(--color-blue-1);')
      expect(result).not.toContain('padding: 1rem;')

      // New styles added
      expect(result).toContain('--pc-test: var(--color-green-1);')
      expect(result).toContain('padding: 3rem;')
    })
    it('should properly update style on props changes but preserve shared styles', async () => {
      const component = mount(
        {
          props: {
            color: responsiveProp<keyof PinceauTheme['color']>('red'),
            size: responsiveProp<'sm' | 'md' | 'lg'>('sm'),
          },
          components: { PinceauRuntimeComponent },
          template: `<div>
            <pinceau-runtime-component color="red" size="sm" />
            <pinceau-runtime-component :color="color" :size="size" />
          </div>`,
        },
        {
          props: {
            msg: 'Hello world',
          },
        },
      )

      const sheet = getSheetFromComponent(component, 'runtime')

      expect(sheet.cache.size).toBe(2)

      const rules = getRulesFromSheet(sheet)

      expect(rules).toBeDefined()

      let result = sheet.toString()

      // Expect sheet to contain the style for the runtime
      expect(result).toContain('--pc-test: var(--color-red-1);')

      await component.setProps({
        color: 'green',
        size: 'lg',
      })

      result = sheet.toString()

      // First component styles
      expect(result).toContain('--pc-test: var(--color-red-1);')
      expect(result).toContain('padding: 1rem;')

      // Second component styles
      expect(result).toContain('--pc-test: var(--color-green-1);')
      expect(result).toContain('padding: 3rem;')
    })
  })
  describe('utils/style.ts', () => {
    const UseStyleComponent = defineComponent({
      props: {
        msg: String,
        color: responsiveProp<ThemeTokens<'$color'>>('$color.blue.1'),
      },
      setup(props) {
        const declaration = computed(() => ({
          color: props.color,
        }))

        const className = useStyle(declaration)

        return {
          className,
        }
      },
      template: '<p :class="className">{{ msg }}</p>',
    })
    it('should properly mount component with useStyle composable', () => {
      const component = mount(
        UseStyleComponent,
        {
          props: {
            color: '$color.blue.1',
            msg: 'Hello world',
          },
        },
      )

      const sheet = getSheetFromComponent(component, 'runtime')

      expect(sheet.cache.size).toBe(1)

      const rules = getRulesFromSheet(sheet)

      expect(rules).toBeDefined()

      const result = sheet.toString()

      // Expect sheet to contain the style for the runtime
      expect(result).toContain('color: var(--color-blue-1);')

      // Assert the rendered text of the component
      expect(component.text()).toContain('Hello world')
    })
    it('should properly update style on props changes and drop unused styles', async () => {
      const component = mount(
        UseStyleComponent,
        {
          props: {
            msg: 'Hello world',
            color: '$color.red.1',
          },
        },
      )

      const sheet = getSheetFromComponent(component, 'runtime')

      expect(sheet.cache.size).toBe(1)

      const rules = getRulesFromSheet(sheet)

      expect(rules).toBeDefined()

      let result = sheet.toString()

      // Expect sheet to contain the style for the runtime
      expect(result).toContain('color: var(--color-red-1);')

      await component.setProps({
        color: '$color.green.1',
      })

      // Update result reference
      result = sheet.toString()

      // Old styles removed
      expect(result).not.toContain('color: var(--color-red-1);')

      // New styles added
      expect(result).toContain('color: var(--color-green-1);')
    })
    it('should properly update style on props changes but preserve shared styles', async () => {
      const component = mount(
        {
          props: {
            color: responsiveProp<ThemeTokens<'$color'>>('$color.blue.1'),
          },
          components: { UseStyleComponent },
          template: `<div>
            <use-style-component color="$color.blue.1" />
            <use-style-component :color="color" />
          </div>`,
        },
        {
          props: {
            msg: 'Hello world',
          },
        },
      )

      const sheet = getSheetFromComponent(component, 'runtime')

      expect(sheet.cache.size).toBe(1)

      const rules = getRulesFromSheet(sheet)

      expect(rules).toBeDefined()

      let result = sheet.toString()

      // Expect sheet to contain the style for the runtime
      expect(result).toContain('color: var(--color-blue-1);')

      await component.setProps({
        color: '$color.green.1',
      })

      result = sheet.toString()

      // First component styles
      expect(result).toContain('color: var(--color-blue-1);')

      // Second component styles
      expect(result).toContain('color: var(--color-green-1);')
    })
  })
  describe('utils/variants.ts', () => {
    const VariantsComponent = defineComponent({
      props: {
        size: responsiveProp<'sm' | 'md' | 'lg'>('sm'),
      },
      setup(props) {
        const variantsClass = useVariants(
          {
            size: {
              sm: {
                padding: '1rem',
              },
              md: {
                padding: '2rem',
              },
              lg: {
                padding: '3rem',
              },
            },
          },
          props,
        )

        return { variantsClass }
      },
      template: '<p :class="variantsClass">Hello world</p>',
    })

    it('should properly mount component with variants', () => {
      const component = mount(
        VariantsComponent,
        {
          props: {
            msg: 'Hello world',
          },
        },
      )

      const sheet = getSheetFromComponent(component, 'runtime')

      expect(sheet.cache.size).toBe(1)

      const rules = getRulesFromSheet(sheet)

      expect(rules).toBeDefined()

      const result = sheet.toString()

      // Expect sheet to contain the style for the runtime
      expect(result).toContain('padding: 1rem;')

      // Assert the rendered text of the component
      expect(component.text()).toContain('Hello world')
    })

    it('should properly update style on props changes and drop unused styles', async () => {
      const component = mount(
        VariantsComponent,
        {
          props: {
            msg: 'Hello world',
            size: 'sm',
          },
        },
      )

      const sheet = getSheetFromComponent(component, 'runtime')

      expect(sheet.cache.size).toBe(1)

      const rules = getRulesFromSheet(sheet)

      expect(rules).toBeDefined()

      let result = sheet.toString()

      // Expect sheet to contain the style for the runtime
      expect(result).toContain('padding: 1rem;')

      await component.setProps({
        size: 'lg',
      })

      result = sheet.toString()

      expect(result).not.toContain('padding: 1rem;')
      expect(result).toContain('padding: 3rem;')
    })

    it('should properly update style on props changes and preserve shared styles', async () => {
      const component = mount(
        {
          props: {
            size: responsiveProp<'sm' | 'md' | 'lg'>('sm'),
          },
          components: { VariantsComponent },
          template: `<div>
            <variants-component size="sm" />
            <variants-component :size="size" />
          </div>`,
        },
        {
          props: {
            size: 'sm',
          },
        },
      )

      const sheet = getSheetFromComponent(component, 'runtime')

      expect(sheet.cache.size).toBe(1)

      const rules = getRulesFromSheet(sheet)

      expect(rules).toBeDefined()

      let result = sheet.toString()

      // Expect sheet to contain the style for the runtime
      expect(result).toContain('padding: 1rem;')

      // Assert the rendered text of the component
      expect(component.text()).toContain('Hello world')

      await component.setProps({
        size: 'lg',
      })

      result = sheet.toString()

      // First component styles
      expect(result).toContain('padding: 1rem;')

      // Second component styles
      expect(result).toContain('padding: 3rem;')
    })

    it('should support string variants', async () => {
      const VariantsClassComponent = defineComponent({
        props: {
          size: responsiveProp<'sm' | 'md' | 'lg'>('sm'),
        },
        setup(props) {
          const variantsClass = useVariants(
            {
              size: {
                sm: 'p-1',
                md: 'p-2',
                lg: 'p-3',
              },
            },
            props,
          )

          const test = ref('test')

          return { variantsClass, test }
        },
        template: '<p :class="variantsClass">Hello world</p>',
      })

      const component = mount(VariantsClassComponent)

      const sheet = getSheetFromComponent(component, 'runtime')

      expect(sheet.cache.size).toBe(0)

      const rules = getRulesFromSheet(sheet)

      expect(rules).toBeDefined()

      const result = sheet.toString()

      // Expect sheet to contain no style as this is classes only rule.
      expect(result).toStrictEqual('')

      expect(component.html()).toContain('class="p-1"')
    })

    it('should support string variants when prop changes', async () => {
      const VariantsClassComponent = defineComponent({
        props: {
          size: responsiveProp<'sm' | 'md' | 'lg'>('sm'),
        },
        setup(props) {
          const variantsClass = useVariants(
            {
              size: {
                sm: 'p-1',
                md: 'p-2',
                lg: 'p-3',
              },
            },
            props,
          )

          return { variantsClass }
        },
        template: '<p :class="variantsClass">Hello world</p>',
      })

      const component = mount(VariantsClassComponent)

      const sheet = getSheetFromComponent(component, 'runtime')

      expect(sheet.cache.size).toBe(0)

      const rules = getRulesFromSheet(sheet)

      expect(rules).toBeDefined()

      const result = sheet.toString()

      // Expect sheet to contain no style as this is classes only rule.
      expect(result).toStrictEqual('')

      expect(component.html()).toContain('class="p-1"')

      await component.setProps({ size: 'lg' })

      expect(component.html()).toContain('class="p-3"')
    })

    it('should support $class and regular styles mix', async () => {
      const VariantsClassComponent = defineComponent({
        props: {
          size: responsiveProp<'sm' | 'md' | 'lg'>('sm'),
        },
        setup(props) {
          const variantsClass = useVariants(
            {
              size: {
                sm: {
                  $class: 'p-1',
                  margin: '1rem',
                },
                md: {
                  $class: 'p-2',
                  margin: '2rem',
                },
                lg: {
                  $class: 'p-3',
                  margin: '3rem',
                },
              },
            },
            props,
          )

          return { variantsClass }
        },
        template: '<p :class="variantsClass">Hello world</p>',
      })

      const component = mount(VariantsClassComponent)

      const sheet = getSheetFromComponent(component, 'runtime')

      expect(sheet.cache.size).toBe(1)

      const rules = getRulesFromSheet(sheet)

      expect(rules).toBeDefined()

      let result = sheet.toString()

      // Expect sheet to contain no style as this is classes only rule.
      expect(result).toContain('margin: 1rem;')

      expect(component.html()).toContain('p-1')

      await component.setProps({ size: 'lg' })

      result = sheet.toString()

      expect(component.html()).toContain('p-3')

      expect(result).not.toContain('margin: 1rem;')
      expect(result).toContain('margin: 3rem;')
    })
  })
})
