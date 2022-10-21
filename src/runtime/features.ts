import type { ComputedRef, Ref } from 'vue'
import { onScopeDispose, reactive, unref, watch } from 'vue'
import defu from 'defu'
import { kebabCase } from 'scule'
import type { PinceauRuntimeIds } from '../types'
import { keyRegex } from '../utils/regexes'
import type { usePinceauStylesheet } from './stylesheet'

/**
 * Resolve a `var(--token)` value from a token path.
 */
export function usePinceauRuntimeFeatures(
  ids: PinceauRuntimeIds,
  props: any,
  variants: any,
  variantsProps: ComputedRef<any>,
  computedStyles: Ref<any[]>,
  css: ComputedRef<any>,
  sheet: ReturnType<typeof usePinceauStylesheet>,
) {
  /**
   * Rules state
   */
  const rules = reactive({
    variants: undefined,
    computedStyles: undefined,
    css: undefined,
  })

  /**
   * Cleanup all runtime styles for this instance.
   */
  const cleanup = () => {
    for (const rule of Object.values(rules)) {
      if (!rule) { continue }
      sheet.deleteRule(rule)
    }
  }

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
        if (rules[key]) { sheet.deleteRule(rules[key]) }
        rules[key] = sheet.pushDeclaration(sourceDeclaration)
      },
      {
        immediate: true,
        deep: true,
      },
    )
  }

  // Register CSS is some provided.
  if (props?.css) {
    registerFeature(
      css,
      newCss => transformCssPropToDeclaration(ids, newCss),
      'css',
    )
  }

  // Register computed styles if some provided.
  if (computedStyles && computedStyles?.value && Object.keys(computedStyles.value || {}).length > 0) {
    registerFeature(
      computedStyles,
      newComputedStyles => transformComputedStylesToDeclaration(ids, newComputedStyles),
      'computedStyles',
    )
  }

  // Register Variants if related props exists.
  if (variants && variants?.value && Object.keys(variants.value || {}).length > 0) {
    registerFeature(
      variantsProps,
      newVariantsProps => transformVariantsToDeclaration(ids, variants.value, newVariantsProps),
      'variants',
    )
  }

  onScopeDispose(cleanup)

  watch(
    rules,
    (newRules, oldRules) => {
      if (!oldRules) { return }
      for (const [key, rule] of Object.entries(newRules)) {
        if (rule !== oldRules[key]) { sheet.deleteRule(oldRules[key]) }
      }
    },
    {
      immediate: true,
      deep: true,
    },
  )
}

/**
  * Take a CSS property and transform every tokens present in it to their value.
  */
export function transformTokensToVariable(property: string): string { return (property || '').replace(keyRegex, (_, tokenPath) => resolveVariableFromPath(tokenPath)) }

/**
 * Resolve a `var(--token)` value from a token path.
 */
export function resolveVariableFromPath(path: string): string { return `var(--${path.split('.').map((key: string) => kebabCase(key)).join('-')})` }

export function transformVariantsToDeclaration(
  ids: PinceauRuntimeIds,
  variants: any,
  props: any,
) {
  const declaration = {}

  // Iterate through all components in `props`
  if (props && Object.keys(props).length) {
    const targetId = `.${ids.variantsClassName}${ids.componentId}`

    // Iterate through all props in `props[componentId][class]`
    for (const [propName, propValue] of Object.entries(props)) {
      // Prop value is an object, iterate through each `@mq`
      if (typeof propValue === 'object') {
        for (const [mqId, mqPropValue] of Object.entries(propValue)) {
          const variantValue = variants[propName][(mqPropValue as any)?.toString?.() || (mqPropValue as string)]

          if (!declaration[targetId]) { declaration[targetId] = {} }

          if (mqId === 'initial') {
            if (!declaration[targetId]['@initial']) { declaration[targetId]['@initial'] = {} }
            declaration[targetId]['@initial'] = defu(declaration[targetId]['@initial'], variantValue)
          }

          const mediaId = (mqId === 'dark' || mqId === 'light') ? `@${mqId}` : `@mq.${mqId}`

          if (!declaration[mediaId]) { declaration[mediaId] = {} }
          if (!declaration[mediaId][targetId]) { declaration[mediaId][targetId] = {} }

          declaration[mediaId][targetId] = defu(declaration[mediaId][targetId], variantValue)
        }
      }
      else {
        const variantValue = variants?.[propName]?.[(propValue as any)?.toString?.() || (propValue as string)]

        if (!variantValue) { continue }

        if (!declaration[targetId]) { declaration[targetId] = {} }

        declaration[targetId] = defu(declaration[targetId], variantValue)
      }
    }
  }

  return declaration
}

export function transformCssPropToDeclaration(
  ids: PinceauRuntimeIds,
  css: any,
) {
  const declaration = {}

  if (css) {
    const targetId = `.${ids.uniqueClassName}${ids.componentId}`
    declaration[targetId] = defu({}, css, declaration[targetId])
  }

  return declaration
}

/**
 * Transform variants and props to a stringifiable object.
 */
export function transformComputedStylesToDeclaration(
  ids: PinceauRuntimeIds,
  computedStyles: { [id: string]: any },
) {
  const declaration = {}

  // Iterate through computed styles
  if (computedStyles && Object.keys(computedStyles).length) {
    const targetId = `.${ids.uniqueClassName}${ids.componentId}`

    declaration[targetId] = declaration[targetId] || {}

    // Iterate on each computed styles
    for (const [varName, _value] of Object.entries(computedStyles)) {
      const value = unref(_value)

      // Handle CSS Prop
      if (varName === 'css') {
        declaration[targetId] = defu(declaration[targetId], value)
        continue
      }

      // Prop value is an object, iterate through each `@mq`
      if (typeof value === 'object') {
        for (const [mqId, mqPropValue] of Object.entries(value)) {
          const _value = unref(mqPropValue) as string

          if (!_value) { continue }

          if (mqId === 'initial') {
            if (!declaration[targetId]) { declaration[targetId] = {} }
            if (!declaration[targetId]['@initial']) { declaration[targetId]['@initial'] = {} }
            declaration[targetId]['@initial'][`--${varName}`] = transformTokensToVariable(_value)
          }

          const mediaId = (mqId === 'dark' || mqId === 'light') ? `@${mqId}` : `@mq.${mqId}`

          if (!declaration[mediaId]) { declaration[mediaId] = {} }
          if (!declaration[mediaId][targetId]) { declaration[mediaId][targetId] = {} }

          declaration[mediaId][targetId][`--${kebabCase(varName)}`] = transformTokensToVariable(_value)
        }
      }
      else {
        const _value = unref(value)
        if (_value) {
          declaration[targetId][`--${kebabCase(varName)}`] = transformTokensToVariable(_value)
        }
      }
    }
  }

  return declaration
}

