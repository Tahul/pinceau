import { parseAst, visitAst } from '../../utils/ast'

export const findPropsKey = (code: string) => {
  try {
    const ast = parseAst(code)

    let propsVariableName

    visitAst(
      ast,
      {
        visitVariableDeclaration(path) {
          if (path.value?.declarations?.[0]?.init?.callee?.name === 'defineProps') {
            propsVariableName = path.value.declarations[0].id.name
            return false
          }

          return this.traverse(path)
        },
      },
    )

    return propsVariableName
  }
  catch (e) {
    return undefined
  }
}
