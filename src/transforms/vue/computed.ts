import type { ASTNode } from 'ast-types'
import { hash } from 'ohash'
import { camelCase, kebabCase } from 'scule'
import { astTypes, printAst, visitAst } from '../../utils/ast'

export function resolveComputedStyles(cssAst: ASTNode, computedStyles: any = {}) {
  // Search for function properties in css() AST
  visitAst(
    cssAst,
    {
      visitObjectProperty(path) {
        if (path.value) {
          const valueType = path.value.value.type

          if (valueType === 'ArrowFunctionExpression' || valueType === 'FunctionExpression') {
            const key = camelCase((path.value.key.name || path.value.key.value).replace(/--/g, '__'))
            const id = `_${hash(path.value.loc.start).slice(0, 3)}_${key}`

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
