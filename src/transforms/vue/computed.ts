import type { ASTNode } from 'ast-types'
import { hash } from 'ohash'
import * as recast from 'recast'

export function resolveComputedStyles(cssAst: ASTNode, computedStyles: any = {}) {
  // Search for function properties in css() AST
  recast.visit(
    cssAst,
    {
      visitObjectProperty(path) {
        if (path.value) {
          const valueType = path.value.value.type

          if (valueType === 'ArrowFunctionExpression' || valueType === 'FunctionExpression') {
            const id = `${hash(path.value.loc.start)}-${path.value.key.name}`

            // Push property function to computedStyles
            computedStyles[id] = recast.print(path.value.value.body).code

            path.replace(
              recast.types.builders.objectProperty(
                path.value.key,
                recast.types.builders.stringLiteral(`v-bind(__$pComputed['${id}'])`),
              ),
            )
          }
        }
        return this.traverse(path)
      },
    },
  )
}
