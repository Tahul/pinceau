import type { ComputedStyleDefinition } from '@pinceau/style'

/**
 * Transform computed styles and props to a stringifiable object.
 */
export function computedStylesToDeclaration(computedStyles?: [string, ReturnType<ComputedStyleDefinition>][]) {
  const declaration = {}

  // Iterate through computed styles
  if (computedStyles?.length) {
    // Iterate on each computed styles
    for (const [varName, value] of computedStyles) {
      // Prop value is an object, iterate through each `@mq`
      if (typeof value === 'object') {
        for (const [mqId, mqPropValue] of Object.entries(value)) {
          // Set initial varName on root
          if (mqId === '$initial') {
            declaration[varName] = mqPropValue
            continue
          }

          if (!declaration[mqId]) { declaration[mqId] = {} }

          declaration[mqId][varName] = mqPropValue
        }
      }
      // Prop value is a raw value
      else {
        declaration[varName] = value
      }
    }
  }

  return declaration
}
