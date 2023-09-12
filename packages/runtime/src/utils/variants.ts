import type { Variants, VariantsProps } from '@pinceau/style'
import { defu } from 'defu'

/**
 * Transforms compiled variants object and props to a stringifiable object.
 */
export function variantsToDeclaration(
  variants: Variants,
  props: VariantsProps,
) {
  let classes: string[] = []

  const resolveClass = (variantValue?: string | string[] | any) => {
    if (variantValue?.$class) {
      classes = [...classes, ...(Array.isArray(variantValue.$class) ? variantValue.$class : variantValue.$class.split(' '))]
      delete variantValue.$class
      return
    }
    if (Array.isArray(variantValue)) {
      classes = [...classes, ...variantValue]
      return
    }
    if (typeof variantValue === 'string') {
      classes = [...classes, ...variantValue.split(' ')]
    }
  }

  let declaration = {}

  // Iterate through all components in `props`
  if (props && Object.keys(props).length) {
    // Iterate through all props in `props[componentId][class]`
    for (const [propName, propValue] of Object.entries(props)) {
      // Prop value is an object, iterate through each `@mq`
      if (typeof propValue === 'object') {
        for (const [mqId, mqPropValue] of Object.entries(propValue || {})) {
          // Find `variants[variant][value]`
          const variantValue = variants[propName][mqPropValue.toString()]
          if (!variantValue) { continue }

          // Support $class or string variant
          resolveClass(variantValue)
          // If variantValue was for $class; skip next step
          if (typeof variantValue === 'string' || Array.isArray(variantValue)) { continue }

          if (mqId === '$initial') {
            declaration = defu(declaration, variantValue)
            continue
          }

          declaration[mqId] = defu(declaration[mqId], variantValue)
        }
      }
      else if (propValue && propName) {
        const variantValue = variants[propName][propValue.toString()]
        if (!variantValue) { continue }

        // Support $class or string variant
        resolveClass(variantValue)
        // If variantValue was for $class; skip next step
        if (typeof variantValue === 'string' || Array.isArray(variantValue)) { continue }

        declaration = defu(declaration, variantValue)
      }
    }
  }

  return { classes, declaration }
}
