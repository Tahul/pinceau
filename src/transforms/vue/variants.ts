import * as recast from 'recast'
import * as parser from 'recast/parsers/typescript'

export interface PropOptions {
  type?: any
  required?: boolean
  default?: any
  validator?: (value: unknown) => boolean
}

export function transformVariants(code = '', variants: any = {}, isTs: boolean): string {
  const variantsProps = resolveVariantsProps(variants, isTs)

  code = code.replace(/(...)?\$variantsProps(,)?/mg, '')

  const sanitizedVariants = Object.entries(variants || {}).reduce(
    (acc, [key, variant]: any) => {
      delete variant.options
      acc[key] = variant
      return acc
    },
    {},
  )

  code += `\nconst __$cstVariants = ${JSON.stringify(sanitizedVariants)}\n`

  code += '\nusePinceauRuntime(__$cstProps, __$cstVariants)\n'

  if (variantsProps) { code = pushVariantsProps(code, variantsProps) }

  return code
}

/**
 * Push variants object to components props.
 *
 * Only work with `defineProps()`.
 */
export function pushVariantsProps(code: string, variantsProps: any) {
  const scriptAst = recast.parse(code, { parser })

  const propsAst = propStringToAst(JSON.stringify(variantsProps))

  // Cast stringified values
  recast.visit(
    propsAst,
    {
      visitObjectProperty(path) {
        // Cast `type` string
        if (path.value?.key?.value === 'type') {
          path.value.value = propStringToAst(path.value.value.value)
        }
        // Cast `validator` string
        if (path.value?.key?.value === 'validator') {
          path.value.value = propStringToAst(path.value.value.value)
        }
        return this.traverse(path)
      },
    },
  )

  // Push to defineProps
  recast.visit(
    scriptAst,
    {
      visitCallExpression(path) {
        if (path?.value?.callee?.name === 'defineProps') {
          path.value.arguments[0].properties.push(
            recast.types.builders.spreadElement(propsAst),
          )
        }
        return this.traverse(path)
      },
    },
  )

  return recast.print(scriptAst).code
}

/**
 * Resolve a Vue component props object from css() variants.
 */
export function resolveVariantsProps(variants, isTs: boolean) {
  const props = {}

  Object.entries(variants).forEach(
    ([key, variant]: [string, any]) => {
      const prop: any = {
        required: false,
      }

      const isBooleanVariant = Object.keys(variant).some(key => (key === 'true' || key === 'false'))
      if (isBooleanVariant) {
        prop.type = ` [Boolean, Object]${isTs ? 'as PropType<boolean | ({ [key in MediaQueriesKeys]: boolean }) | ({ [key: string]: boolean })>' : ''}`
        prop.default = false
      }
      else {
        const possibleValues = `\'${Object.keys(variant).join('\' | \'')}\'`
        prop.type = ` [String, Object]${isTs ? ` as PropType<${possibleValues} | ({ [key in MediaQueriesKeys]: ${possibleValues} }) | ({ [key: string]: ${possibleValues} })>` : ''}`
        prop.default = undefined
      }

      if (variant?.options) {
        const options = variant.options
        if (options.default) { prop.default = options.default }
        if (options.required) { prop.required = options.required }
        if (options.type) { prop.type = options.type }
        if (options.validator) { prop.validator = options.validator.toString() }
      }

      props[key] = prop
    },
  )

  return props
}

/**
 * Cast a `props.type` string into an AST declaration.
 */
export function propStringToAst(type: string) {
  const parsed = recast.parse(`const toAst = ${type}`, { parser })
  return parsed.program.body[0].declarations[0].init
}
