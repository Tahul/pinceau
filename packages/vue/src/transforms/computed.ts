import type { ASTNode } from 'ast-types'
import { hash } from 'ohash'
import { camelCase, kebabCase } from 'scule'
import type { PinceauSFCTransformContext } from '@pinceau/core'
import { astTypes, printAst, visitAst } from '@pinceau/core'

export function resolveRuntimeContents(
  cssFunctionAst: ASTNode,
  transformContext: PinceauSFCTransformContext,
) {
  // Search for function properties in css() AST
  visitAst(
    cssFunctionAst,
    {
      visitObjectProperty(path) {
        if (path.value) {
          // Resolve path key
          const key = path?.value?.key?.name || path?.value?.key?.value

          const valueType = path?.value?.value?.type

          // Store variable tokens in local map
          if (key.startsWith('--') && !transformContext.localTokens[key]) { transformContext.localTokens[key] = path.value.value }

          // Store computed styles in local map
          if (valueType === 'ArrowFunctionExpression' || valueType === 'FunctionExpression') {
            const computedStyleKey = camelCase((key).replace(/--/g, '__'))
            const id = `_${hash(path.value.loc.start).slice(0, 3)}_${computedStyleKey}`

            // Push property function to computedStyles
            transformContext.computedStyles[id] = printAst(path.value.value.body).code

            path.replace(
              astTypes.builders.objectProperty(
                path.value.key,
                astTypes.builders.stringLiteral(`var(--${kebabCase(id)})`),
              ),
            )
          }
        }
        return this.traverse(path)
      },
    },
  )
}
