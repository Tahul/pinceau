import defu from 'defu'
import { kebabCase } from 'scule'
import { hash } from 'ohash'
import type { ComponentInternalInstance } from 'vue'
import { unref } from 'vue'
import { keyRegex } from '../utils/regexes'
import type { PinceauRuntimeIds } from '../types'

// Local re-exports, avoiding whole bundle
export { resolveCssProperty } from '../utils/css'
export { stringify } from '../utils/stringify'
export { createTokensHelper } from '../utils/$tokens'

/**
 * Check if a string is a resolvable token path.
 */
export function isToken(token: string) { return keyRegex.test(token) }

/**
 * Resolve a `var(--token)` value from a token path.
 */
export function resolveVariableFromPath(path: string): string { return `var(--${path.split('.').map((key: string) => kebabCase(key)).join('-')})` }

/**
  * Take a CSS property and transform every tokens present in it to their value.
  */
export function transformTokensToVariable(property: string): string { return (property || '').replace(keyRegex, (_, tokenPath) => resolveVariableFromPath(tokenPath)) }

/**
 * Handles a scale of tokens easily.
 */
export function scale(type: any, prop: any, base = '500') {
  // Is a token, return it as is.
  if (isToken(prop)) { return prop }

  // Is a string, concatenate it with type & defaultShade
  if (typeof prop === 'string') {
    return `var(--${type}-${prop}-${base})`
  }

  // No valid type, return it as is.
  return prop
}

export const utils = {
  resolveVariableFromPath,
  transformTokensToVariable,
  isToken,
  scale,
}

/**
 * Takes a props object and a variants and remove unnecessary props.
 */
export function sanitizeProps(propsObject: any, variants: any): any {
  if (!propsObject || !variants) {
    return {}
  }

  return Object.entries(propsObject)
    .reduce(
      (acc: any, [key, value]) => {
        if (variants[key]) { acc[key] = value }
        return acc
      },
      {},
    )
}

export const transformVariantsToDeclaration = (
  ids: PinceauRuntimeIds,
  variants: any,
  props: any,
) => {
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

export const getIds = (uid: string, instance: ComponentInternalInstance, props: any, variants: any, dev = false): PinceauRuntimeIds => {
  const instanceId = (instance?.vnode?.type as any)?.__scopeId || 'data-v-unknown'

  const componentId = `[${instanceId}]`

  const hashed = hash({
    uid,
    componentId,
    props: JSON.stringify(props),
    variants: JSON.stringify(variants),
  })

  const devPrefix = `${dev ? `-${(instance?.vnode?.type as any)?.__name}-` : '-'}`

  const variantsClassName = `p${devPrefix}v${dev ? 'ariants' : ''}-${hashed}`

  const uniqueClassName = uid ? `p${devPrefix}${hash({ componentId, uid })}` : undefined

  return { uid, componentId, variantsClassName, uniqueClassName }
}
