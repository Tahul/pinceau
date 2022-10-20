import type { Plugin, PropType } from 'vue'
import { computed, getCurrentInstance, onScopeDispose, reactive, ref, watch } from 'vue'
import { defu } from 'defu'
import { nanoid } from 'nanoid'
import type { CSS, PinceauTheme } from '../types'
import { resolveCssProperty } from '../utils/css'
import { stringify } from '../utils/stringify'
import { createTokensHelper, getIds, sanitizeProps, transformComputedStylesToDeclaration, transformCssPropToDeclaration, transformVariantsToDeclaration } from './utils'
import { usePinceauStylesheet } from './stylesheet'

export const plugin: Plugin = {
  install(app, { theme, helpersConfig, multiApp = false, idStorage = (id, _) => ref(id), colorSchemeMode = 'media', dev = process.env.NODE_ENV !== 'production' }) {
    theme = defu(theme || {}, { theme: {} })

    helpersConfig = defu(helpersConfig, { flattened: true })

    const multiAppId = multiApp ? nanoid(6) : undefined

    const $tokens = createTokensHelper(theme.theme, helpersConfig)

    const { sheet, toString: sheetToString } = usePinceauStylesheet(multiAppId)

    const declarationToCss = (decl: any) => stringify(decl, (property: any, value: any, style: any, selectors: any) => resolveCssProperty(property, value, style, selectors, $tokens, colorSchemeMode))

    const pushDeclaration = (
      declaration: any,
      previousRule?: any,
    ): CSSRule => {
      const cssText = declarationToCss({ '@media': declaration })

      if (!cssText) { return }

      const index = previousRule
        ? Object.values(sheet.value.cssRules).indexOf(previousRule)
        : sheet.value.cssRules.length

      const ruleId = sheet.value.insertRule(cssText, index)

      return sheet.value.cssRules[ruleId]
    }

    const deleteRule = (rule: CSSRule) => {
      const ruleIndex = Object.values(sheet.value.cssRules).indexOf(rule)

      if (typeof ruleIndex === 'undefined' || isNaN(ruleIndex)) { return }

      try {
        sheet.value.deleteRule(ruleIndex)
      }
      catch (e) {
        // Continue regardless of error
      }
    }

    const setupPinceauRuntime = (
      props: any,
      variants: any,
      computedStyles: any,
    ) => {
      const instance = getCurrentInstance()
      const variantsProps = computed(() => variants && variants?.value ? sanitizeProps(props, variants.value) : {})
      const css = computed(() => props?.css || undefined)

      /**
       * Generate IDs for current component instance.
       */
      let uid
      const ids = idStorage(
        getIds(
          (uid = nanoid(6)) && uid,
          instance,
          variantsProps.value,
          variants?.value || {},
          dev,
        ),
        `p-${uid}`,
      )

      /**
       * Exposed `class` array
       */
      const $pinceau = computed(() => [ids.value.uniqueClassName, ids.value.variantsClassName].filter(Boolean).join(' '))

      /**
       * Rules state
       */
      const rules = reactive({
        variants: undefined,
        computedStyles: undefined,
        css: undefined,
      })

      /**
       * Register a feature and watch its event source to update according styling.
       *
       * Currently supports: Variants, Computed Styles, CSS Prop
       */
      const registerFeature = (source: any, transform: any, key: string) => {
        watch(
          source,
          (newSource) => {
            const sourceDeclaration = transform(newSource)
            if (rules[key]) { deleteRule(rules[key]) }
            rules[key] = pushDeclaration(sourceDeclaration)
          },
          {
            immediate: true,
            deep: true,
          },
        )
      }

      // Register CSS is some provided.
      if (Object.hasOwn(props, 'css')) {
        registerFeature(
          css,
          newCss => transformCssPropToDeclaration(ids.value, newCss),
          'css',
        )
      }

      // Register computed styles if some provided.
      if (computedStyles && computedStyles?.value && Object.keys(computedStyles.value || {}).length > 0) {
        registerFeature(
          computedStyles,
          newComputedStyles => transformComputedStylesToDeclaration(ids.value, newComputedStyles),
          'computedStyles',
        )
      }

      // Register Variants if related props exists.
      if (variants && variants?.value && Object.keys(variants.value || {}).length > 0) {
        registerFeature(
          variantsProps,
          newVariantsProps => transformVariantsToDeclaration(ids.value, variants.value, newVariantsProps),
          'variants',
        )
      }

      const cleanup = () => {
        for (const rule of Object.values(rules)) {
          if (!rule) { continue }
          deleteRule(rule)
        }
      }

      onScopeDispose(cleanup)

      watch(
        rules,
        (newRules, oldRules) => {
          if (!oldRules) { return }

          for (const [key, rule] of Object.entries(newRules)) {
            if (rule !== oldRules[key]) { deleteRule(oldRules[key]) }
          }
        },
        {
          immediate: true,
          deep: true,
        },
      )

      return { $pinceau }
    }

    app.config.globalProperties.$pinceauRuntime = setupPinceauRuntime
    app.config.globalProperties.$pinceauSsr = {
      get: () => sheetToString(),
    }
    app.provide('pinceauRuntime', setupPinceauRuntime)
  },
}

/**
 * A prop to be used on any component to enable `:css` prop.
 */
export const cssProp = {
  type: Object as PropType<CSS<PinceauTheme, {}, {}, false>>,
  required: false,
  default: undefined,
}
