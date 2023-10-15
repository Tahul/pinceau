import type { PinceauTransformContext } from '@pinceau/core'
import { getCharAfterLastImport, parseAst } from '@pinceau/core/utils'
import type { Variants } from '@pinceau/style'

export interface PropOptions {
  type?: any
  required?: boolean
  default?: any
  possibleValues?: (string | boolean)[]
  validator?: (value: unknown) => boolean
}

/**
 * Resolve a Vue component props object from css() variant.
 */
export function resolveVariantsProps(
  variants: Variants<any>,
  isTs?: boolean,
) {
  const props: { [key: string]: PropOptions } = {}

  Object.entries(variants).forEach(
    ([key, variant]: [string, any]) => {
      const prop: any = {
        required: false,
      }

      const isBooleanVariant = Object.keys(variant).some(key => (key === 'true' || key === 'false'))
      if (isBooleanVariant) {
        // Type gets written as string as it gets casted to AST later on.
        prop.type = isTs ? 'ResponsiveProp<boolean>' : ''
        prop.possibleValues = [true, false]
        prop.default = false
      }
      else {
        prop.possibleValues = Object.keys(variant).filter(key => key !== 'options')
        // Type gets written as string as it gets casted to AST later on.
        prop.type = isTs ? ` ResponsiveProp<\'${prop.possibleValues.join('\' | \'')}\'>` : ''
        prop.default = undefined
      }

      // Merge options from user definition
      if (variant?.options) {
        const options = variant.options
        if (options.default) { prop.default = options.default }
        if (options.required) { prop.required = options.required }
        if (options.type) { prop.type = options.type }
        if (options.validator) { prop.validator = options.validator?.toString() }
      }

      props[key] = prop
    },
  )

  return props
}

/**
 * Cast a variants props AST output to a type-safe props object.
 */
export function castVariantsProps(variantsProps: { [key: string]: PropOptions }) {
  return `\n${Object.entries(variantsProps).reduce<string[]>(
    (acc, [key, value]) => {
      let result = `${key}`

      if (value.default) {
        let stringified: string | undefined
        try {
          if (JSON.parse(value.default)) { stringified = value.default }
        }
        catch (_) { stringified = `\`${value.default}\`` }
        if (stringified) { result += ` = ${stringified}` }
      }

      acc.push(result)

      return acc
    },
    [],
  ).join(',\n')},`
}

export function castVariantsPropsTypeExpression(
  variantsProps: { [key: string]: PropOptions },
) {
  return `{
    ${Object.entries(variantsProps).map(
      ([key, value]) => {
        const result = `${key}${value?.required ? '' : '?'}: ResponsiveProp<${value?.possibleValues?.map(value => typeof value === 'boolean' ? value : `\'${value}\'`)?.join(' | ')}>`
        if (value?.possibleValues) { delete value.possibleValues }
        return result
      },
  ).join(',\n')}
}`
}

export function sanitizeVariantsDeclaration(variants: Variants) {
  return Object.entries(variants).reduce(
    (acc, [key, variant]: any) => {
      const _variants = { ...variant }
      delete _variants.options
      acc[key] = _variants
      return acc
    },
    {},
  )
}

export function sanitizeVariantsProps(variants: Variants) {
  return Object.entries(variants).reduce(
    (acc, [key, variant]: any) => {
      delete variant.possibleValues
      acc[key] = variant
      return acc
    },
    {},
  )
}

export function castVariantsPropsToDefaults(
  variantsProps: { [key: string]: PropOptions },
) {
  return Object.entries(variantsProps).reduce(
    (acc, [key, value]) => {
      if (value.default) { acc[key] = value.default }
      return acc
    },
    {},
  )
}
