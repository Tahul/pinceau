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
          const test = path.get('defineProps')
          propsVariableName = test?.parentPath?.value?.declarations?.[0]?.id?.name
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
