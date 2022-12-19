import { nanoid } from 'nanoid'
import type { ComputedRef, Ref } from 'vue'
import { defu } from 'defu'
import { computed, onScopeDispose, watch } from 'vue'
import type { PinceauRuntimeIds } from '../../types'
import type { usePinceauStylesheet } from '../stylesheet'

export const usePinceauVariants = (
  ids: ComputedRef<PinceauRuntimeIds>,
  variants: Ref<any>,
  props: ComputedRef<any>,
  sheet: ReturnType<typeof usePinceauStylesheet>,
  classes: Ref<any>,
  cache: any,
) => {
  let rule: CSSRule = sheet.hydratableRules?.[ids.value.uid]?.p
  const variantsState = computed(() => variants && variants?.value ? resolveVariantsState(ids.value, props.value, variants.value) : {})

  watch(
    variantsState,
    ({ cacheId, variantsProps }) => {
      let variantClass: string
      if (cache[cacheId]) {
        // Resolve variant rule
        const cachedRule = cache[cacheId]
        rule = cachedRule.rule
        variantClass = cachedRule.variantClass
        cachedRule.count++
      }
      else {
        // Push a new variant in stylesheet
        variantClass = `pv-${nanoid(6)}`
        const transformed = transformVariantsToDeclaration(variantClass, ids.value, variants.value, variantsProps)
        rule = sheet.pushDeclaration(ids.value.uid, 'v', transformed)
        cache[cacheId] = { rule, variantClass, count: 1 }
      }

      classes.value.v = variantClass
    },
    {
      immediate: true,
    },
  )

  // Cleanup variants if last component using it
  onScopeDispose(
    () => {
      const state = variantsState?.value
      const cachedRule = cache?.[state.cacheId]

      if (cachedRule) {
        cachedRule.count--
        if (cachedRule.count <= 0) {
          sheet.deleteRule(cachedRule.rule)
          delete cache[state.cacheId]
        }
      }
    },
  )
}

/**
 * Transforms compiled variants object and props to a stringifiable object.
 */
export function transformVariantsToDeclaration(
  variantClass: string,
  ids: PinceauRuntimeIds,
  variants: any,
  props: any,
) {
  const declaration = {}

  // Iterate through all components in `props`
  if (props && Object.keys(props).length) {
    const targetId = `.${variantClass}`

    // Iterate through all props in `props[componentId][class]`
    for (const [propName, propValue] of Object.entries(props)) {
      // Prop value is an object, iterate through each `@mq`
      if (typeof propValue === 'object') {
        for (const [mqId, mqPropValue] of Object.entries(propValue)) {
          const _value = (mqPropValue as any)?.toString() || (mqPropValue as string)
          const variantValue = variants[propName][_value]

          if (!variantValue) { continue }

          if (!declaration[targetId]) { declaration[targetId] = {} }

          if (mqId === 'initial') {
            if (!declaration[targetId]) { declaration[targetId] = {} }
            declaration[targetId] = defu(declaration[targetId], variantValue)
          }

          const mediaId = `@${mqId}`

          if (!declaration[mediaId]) { declaration[mediaId] = {} }

          if (!declaration[mediaId][targetId]) { declaration[mediaId][targetId] = {} }

          declaration[mediaId][targetId] = defu(declaration[mediaId][targetId], variantValue)
        }
      }
      else {
        const _value = (propValue as any)?.toString?.() || (propValue as string)
        const variantValue = variants?.[propName]?.[_value]

        if (!variantValue) { continue }

        if (!declaration[targetId]) { declaration[targetId] = {} }

        declaration[targetId] = defu(declaration[targetId], variantValue)
      }
    }
  }

  return declaration
}

/**
 * Resolve current cache id and variants props
 */
export function resolveVariantsState(ids: PinceauRuntimeIds, props: any, variants: any) {
  if (!props || !variants) { return {} }

  let cacheId = ids.componentId

  // Resolve variants props and build cache id
  const variantsProps = Object.entries(props)
    .reduce(
      (acc, [propName, propValue]) => {
        if (!variants[propName]) { return acc }

        if (typeof propValue === 'object') {
          Object.entries(propValue).forEach(
            ([key, value]) => {
              cacheId += `${propName}:${key}:${value}|`
            },
          )
        }
        else {
          cacheId += `${propName}:${propValue}|`
        }

        acc[propName] = propValue

        return acc
      },
      {},
    )

  return { cacheId, variantsProps }
}

/**
 * Takes a props object and a variants and remove unnecessary props.
 */
export function sanitizeProps(propsObject: any, variants: any): any {
  if (!propsObject || !variants) { return {} }

  return Object.entries(propsObject)
    .reduce(
      (acc: any, [key, value]) => {
        if (variants[key]) { acc[key] = value }
        return acc
      },
      {},
    )
}
