import * as recast from 'recast'

export const findPropsKey = (code: string) => {
  try {
    const ast = recast.parse(
      code,
      {
        parser: require('recast/parsers/typescript'),
      },
    )

    let propsVariableName

    recast.visit(
      ast,
      {
        visitVariableDeclaration(path) {
          if (path.value.declarations[0].init.callee.name === 'defineProps') {
            propsVariableName = path.value.declarations[0].id.name
          }

          return this.traverse(path)
        },
      },
    )

    console.log({ propsVariableName })

    return propsVariableName
  }
  catch (e) {
    return undefined
  }
}
