import { astTypes, pathToVarName, printAst, toHash, visitAst } from '@pinceau/core/utils'
import type { PinceauTransformContext } from '@pinceau/core'
import { camelCase, kebabCase } from 'scule'
import type { PinceauStyleFunctionContext } from '../types'
import type { CSSFunctionSource, StyledFunctionSource } from '../types/ast'

export function isPropertyValueType(node: any) {
  const valueType = node?.value?.value?.type
  if (['ArrowFunctionExpression', 'FunctionExpression', 'StringLiteral', 'NumericLiteral'].includes(valueType)) { return true }
  return false
}

export function resolveStyleArg(
  transformContext: PinceauTransformContext,
  arg: CSSFunctionSource | StyledFunctionSource,
  localTokens: PinceauStyleFunctionContext['localTokens'],
  computedStyles: PinceauStyleFunctionContext['computedStyles'],
) {
  visitAst(
    arg,
    {
      visitObjectProperty(path) {
        if (path.value) {
          // Resolve path key & type
          const key = path?.value?.key?.name || path?.value?.key?.value
          const valueType = path?.value?.value?.type

          // Store local tokens
          if (key.startsWith('$') && isPropertyValueType(path)) {
            localTokens[key] = path.value.value
            if (path.value.key.value) { path.value.key.value = pathToVarName(key) }
          }

          // Store computed styles in state
          if (valueType === 'ArrowFunctionExpression' || valueType === 'FunctionExpression') {
            // Create a unique id from the ComputedStyle LOC.
            const hash = toHash({
              start: path.value.loc.start,
              end: path.value.loc.end,
              filename: transformContext.query.filename,
            })

            // Create computed styles identifiers
            const computedStyleKey = camelCase((key).replace(/--/g, '__').replace(/\$/g, ''))
            const id = `pcs_${hash}_${computedStyleKey}`
            const variable = `--${kebabCase(id)}`

            // Push property function to computedStyles
            computedStyles.push({
              id,
              variable,
              ast: path.value.value.body,
              compiled: printAst(path.value.value).code,
            })

            // Overwrite function in declaration by the CSS variable.
            path.replace(
              astTypes.builders.objectProperty(
                path.value.key,
                astTypes.builders.stringLiteral(`var(${variable})`),
              ),
            )
          }
        }

        return this.traverse(path)
      },
    },
  )
}
