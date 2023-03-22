import type { ASTNode } from 'ast-types'
import type { PinceauTransformContext } from '../../types'
import { expressionToAst, parseAst, printAst, visitAst } from '../../utils/ast'

export interface PropOptions {
  type?: any
  required?: boolean
  default?: any
  validator?: (value: unknown) => boolean
}

/**
 * Takes variants object and turns it into a `const` inside `<script setup>`
 */
export function transformVariants(transformContext: PinceauTransformContext, isTs?: boolean) {
  const scriptSetupBlock = transformContext.sfc.descriptor.scriptSetup

  isTs = typeof isTs === 'undefined'
    ? (
        transformContext.sfc.descriptor.scriptSetup.lang === 'ts'
        || transformContext.sfc.descriptor.scriptSetup.attrs.lang === 'ts'
      )
    : isTs

  const variantsProps = resolveVariantsProps(transformContext, isTs)

  const sanitizedVariants = Object.entries(transformContext.variants || {}).reduce(
    (acc, [key, variant]: any) => {
      delete variant.options
      acc[key] = variant
      return acc
    },
    {},
  )

  transformContext.magicString.prependLeft(
    scriptSetupBlock.loc.end.offset,
    `\nconst __$pVariants = ${JSON.stringify(sanitizedVariants)}\n`,
  )

  if (variantsProps) { pushVariantsProps(transformContext, variantsProps, isTs) }

  return transformContext
}

/**
 * Push variants object to components props.
 *
 * Only work with `defineProps()`.
 */
export function pushVariantsProps(
  transformContext: PinceauTransformContext,
  variantsProps: any,
  isTs: boolean,
) {
  const code = transformContext.sfc.descriptor.scriptSetup.content
  const scriptSetupBlock = transformContext.sfc.descriptor.scriptSetup

  const scriptAst = parseAst(code)

  let propsAst = expressionToAst(JSON.stringify(variantsProps))

  propsAst = castVariantsPropsAst(propsAst, isTs)

  visitAst(
    scriptAst,
    {
      visitSpreadElement(path) {
        return this.traverse(path)
      },
    },
  )
}

/**
 * Resolve a Vue component props object from css() variant.
 */
export function resolveVariantsProps(transformContext: PinceauTransformContext, isTs: boolean) {
  const props: Record<string, PropOptions> = {}

  Object.entries(transformContext.variants).forEach(
    ([key, variant]: [string, any]) => {
      const prop: any = {
        required: false,
      }

      const isBooleanVariant = Object.keys(variant).some(key => (key === 'true' || key === 'false'))
      if (isBooleanVariant) {
        prop.type = isTs ? ' [Boolean, Object] as import(\'vue\').PropType<boolean | { [key in import(\'pinceau\').PinceauMediaQueries]?: boolean }>' : ' [Boolean, Object]'
        prop.default = false
      }
      else {
        const possibleValues = `\'${Object.keys(variant).filter(key => key !== 'options').join('\' | \'')}\'`
        prop.type = isTs ? ` [String, Object] as import(\'vue\').PropType<${possibleValues} | { [key in import(\'pinceau\').PinceauMediaQueries]?: ${possibleValues} }>` : ' [String, Object]'
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
export function castVariantsPropsAst(ast: ASTNode, isTs?: boolean) {
  // Cast stringified values
  visitAst(
    ast,
    {
      visitObjectProperty(path) {
        const key = path.value?.key?.value
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
