import defu from 'defu'
import { kebabCase } from 'scule'
import { hash } from 'ohash'
import type { ComponentInternalInstance } from 'vue'
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
 * Takes a props object and a variants and remove unnecessary props.
 */
export function sanitizeProps(propsObject: any, variants: any): any {
  return Object.entries(propsObject)
    .reduce(
      (acc, [key, value]) => {
        if (variants[key]) { acc[key] = value }
        return acc
      },
      {},
    )
}

/**
 * Transform variants and props to a stringifiable object.
 */
export function transformStateToDeclaration(
  variants: { [id: string]: any },
  props: { [id: string]: any },
  computedStyles: { [id: string]: any },
) {
  const declaration = {}

  // Iterate through computed styles
  if (computedStyles && Object.keys(computedStyles).length) {
    // Iterate through all unique components in `computedStyles[componentId]`
    Object.entries(computedStyles)
      .forEach(([_, classes]) => {
        // Iterate through all computed styles in `computedStyles[componentId][class]`
        Object.entries(classes).forEach(
          ([className, value]) => {
            declaration[`.${className}`] = (value as any)?.css || {}
          },
        )
      })
  }

  // Iterate through all components in `props`
  if (props && Object.keys(props).length) {
    Object.entries(props).forEach(
      ([componentId, classes]) => {
      // Iterate through all unique components in `props[componentId]`
        Object.entries(classes).forEach(
          ([className, classProps]) => {
            const targetId = `.${className}`

            // Iterate through all props in `props[componentId][class]`
            Object.entries(classProps).forEach(
              ([propName, propValue]) => {
              // Prop value is an object, iterate through each `@mq`
                if (typeof propValue === 'object') {
                  Object.entries(propValue).forEach(
                    ([mqId, mqPropValue]: [string, string]) => {
                      mqId = `@mq.${mqId}`
                      const variantValue = variants[componentId][propName][mqPropValue?.toString?.() || propValue]

                      if (!declaration[mqId]) { declaration[mqId] = {} }
                      if (!declaration[mqId][targetId]) { declaration[mqId][targetId] = {} }

                      declaration[mqId][targetId] = defu(declaration[mqId][targetId], variantValue)
                    },
                  )
                }
                else {
                  const variantValue = variants[componentId][propName][propValue?.toString?.() || propValue]

                  if (!declaration[targetId]) { declaration[targetId] = {} }

                  declaration[targetId] = defu(declaration[targetId], variantValue)
                }
              },

            )
          },
        )
      },
    )
  }

  return declaration
}

export const getIds = (instance: ComponentInternalInstance, css: any, props: any, variants: any): PinceauRuntimeIds => {
  const componentId = `[${(instance.vnode.type as any).__scopeId}]`

  const uid = instance.uid.toString()

  const hashed = hash({
    componentId,
    props: JSON.stringify(props),
    variants: JSON.stringify(variants),
  })

  const className = `p-${hashed}`

  const computedClassName = css && Object.keys(css).length ? `p-${hash(JSON.stringify(css))}` : undefined

  return { uid, componentId, className, computedClassName }
}
