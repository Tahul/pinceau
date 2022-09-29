import * as recast from 'recast'
import * as parser from 'recast/parsers/typescript'

export const findPropsKey = (code: string) => {
  try {
    const ast = recast.parse(code, { parser })

    let propsVariableName

    recast.visit(
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
