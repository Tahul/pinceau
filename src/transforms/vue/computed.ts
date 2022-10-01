import type { ASTNode } from 'ast-types'
import { hash } from 'ohash'
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
            const id = `${hash(path.value.loc.start)}-${path.value.key.name}`

            // Push property function to computedStyles
            computedStyles[id] = printAst(path.value.value.body).code

            path.replace(
              astTypes.builders.objectProperty(
                path.value.key,
                astTypes.builders.stringLiteral(`v-bind(__$pComputed['${id}'])`),
              ),
            )
          }
        }
        return this.traverse(path)
      },
    },
  )
}
