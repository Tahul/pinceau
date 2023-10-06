import type { ASTNode, namedTypes } from 'ast-types'
import type { PinceauTransformContext } from '@pinceau/core'
import { astTypes, expressionToAst, getCharAfterLastImport, parseAst, printAst, typeToAst, visitAst } from '@pinceau/core/utils'
import type { Variants } from '@pinceau/style'
import type { NodePath } from 'ast-types/lib/node-path'

export interface PropOptions {
  type?: any
  required?: boolean
  default?: any
  possibleValues?: (string | boolean)[]
  validator?: (value: unknown) => boolean
}

/**
 * Push variants object to components props.
 *
 * Only work with `defineProps()`.
 */
export function pushVariantsProps(
  transformContext: PinceauTransformContext,
  variantsProps: any,
) {
  const scriptAst = transformContext?.target?.ast || parseAst(transformContext.target.toString())

  let targetProps: (NodePath<namedTypes.CallExpression> & ASTNode & { loc: any }) | undefined
  let writeableProps: (NodePath & ASTNode) | undefined

  // Push to defineProps
  visitAst(
    scriptAst,
    {
      visitCallExpression(path) {
        if (path?.value?.callee?.name === 'defineProps') {
          // Handle defineProps({ ...variants })
          if (path?.value?.arguments?.[0]?.properties) {
            targetProps = path.value.arguments[0]

            const propsAst = castVariantsPropsAst(variantsProps)

            path.value.arguments[0].properties.push(astTypes.builders.spreadElement(propsAst as any))

            writeableProps = path.value.arguments[0]

            return false
          }

          // Handle defineProps<{ ... } & { ...VariantsExpression }>()
          if (path?.value?.typeParameters?.params) {
            targetProps = path.value.typeParameters.params[0]

            const propsExpression = castVariantsPropsTypeExpression(variantsProps)

            writeableProps = typeToAst(`${propsExpression} & ${printAst(path.value.typeParameters.params[0]).code}`, 'type UnionProps =')

            return false
          }

          // Handle defineProps() empty call
          if (path?.value?.arguments) {
            path.value.arguments.push(castVariantsPropsAst(variantsProps))

            writeableProps = path.value.arguments[0]

            return false
          }
        }

        return this.traverse(path)
      },
    },
  )

  let targetDefaults: (NodePath<namedTypes.ObjectExpression> & ASTNode & { loc: any; properties: any[] }) | undefined
  let writeableDefaults: (NodePath & ASTNode) | undefined

  // Handle `withDefaults` usage
  visitAst(
    scriptAst,
    {
      visitCallExpression(path) {
        if (path?.value?.callee?.name === 'withDefaults') {
          targetDefaults = path?.value?.arguments?.[1] as NodePath<namedTypes.ObjectExpression> & ASTNode & { loc: any; properties: any[] } | undefined

          if (!targetDefaults) { return }

          const variantsDefaults = expressionToAst(JSON.stringify(castVariantsPropsToDefaults(variantsProps)))

          targetDefaults.properties.push(astTypes.builders.spreadElement(variantsDefaults))

          writeableDefaults = targetDefaults
        }

        return this.traverse(path)
      },
    },
  )

  // If withDefaults has been found and is overwriteable, overwrite it with new defaults.
  if (targetDefaults && writeableDefaults) {
    transformContext.target.overwrite(
      targetDefaults.loc.start.index,
      targetDefaults.loc.end.index,
      printAst(writeableDefaults).code,
    )
  }

  // `defineProps` found in existing component code, overwrite it with new one.
  if (targetProps && writeableProps) {
    transformContext.target.overwrite(
      targetProps.loc.start.index,
      targetProps.loc.end.index,
      printAst(writeableProps).code,
    )
    return
  }

  // No `defineProps` found in existing component code, push a new one.
  const importsEnd = getCharAfterLastImport(scriptAst)

  const definePropsContent = printAst(castVariantsPropsAst(variantsProps)).code

  transformContext.target.appendLeft(importsEnd, `\ndefineProps(${definePropsContent})`)
}

/**
 * Resolve a Vue component props object from styled() variants.
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
        prop.type = isTs ? ' [Boolean, Object] as ResponsivePropType<boolean>' : ' [Boolean, Object]'
        prop.possibleValues = [true, false]
        prop.default = false
      }
      else {
        prop.possibleValues = Object.keys(variant).filter(key => key !== 'options')
        // Type gets written as string as it gets casted to AST later on.
        prop.type = isTs ? ` [String, Object] as ResponsivePropType<\'${prop.possibleValues.join('\' | \'')}\'>` : ' [String, Object]'
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
export function castVariantsPropsAst(
  variantsProps: { [key: string]: PropOptions },
  isTs?: boolean,
) {
  // Cleanup and cast variantsProps
  const ast = expressionToAst(JSON.stringify(sanitizeVariantsProps(variantsProps)))

  // Cast stringified values
  visitAst(
    ast,
    {
      visitObjectProperty(path) {
        const key = path.value?.key?.value

        // Drop possibleValues
        if (key === 'possibleValues') {
          path.parent.properties = path.parent?.properties?.filter(property => property !== path)
          return this.traverse(path)
        }
        // Cast `type` string
        if (key === 'type') { path.value.value = expressionToAst(path.value.value.value) }
        // Cast `validator` string
        if (key === 'validator') { path.value.value = expressionToAst(path.value.value.value) }
        // Cast required & default to `{value} as const`
        if ((key === 'required' || key === 'default') && isTs) {
          const printedAst = printAst(path.value.value).code
          path.value.value = expressionToAst(`${printedAst} as const`)
        }
        return this.traverse(path)
      },
    },
  )

  return ast
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
      delete variant.options
      acc[key] = variant
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
