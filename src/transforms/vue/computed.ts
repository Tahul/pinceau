import type { ASTNode } from 'ast-types'
import { hash } from 'ohash'
import { camelCase, kebabCase } from 'scule'
import { astTypes, printAst, visitAst } from '../../utils/ast'

export function resolveRuntimeContents(cssAst: ASTNode, computedStyles: any = {}, localTokens: any = {}) {
  // Search for function properties in css() AST
  visitAst(
    cssAst,
    {
      visitObjectProperty(path) {
        if (path.value) {
          // Resolve path key
          const key = path?.value?.key?.name || path?.value?.key?.value
          const valueType = path?.value?.value?.type

          // Store variable tokens in local map
          if (key.startsWith('--')) { localTokens[key] = path.value.value }

          // Store computed styles in local map
          if (valueType === 'ArrowFunctionExpression' || valueType === 'FunctionExpression') {
            const computedStyleKey = camelCase((key).replace(/--/g, '__'))
            const id = `_${hash(path.value.loc.start).slice(0, 3)}_${computedStyleKey}`

            // Push property function to computedStyles
            computedStyles[id] = printAst(path.value.value.body).code

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
