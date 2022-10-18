import { parseAst, visitAst } from '../../utils/ast'

export const resolvePropsKey = (code: string, add = true) => {
  try {
    const ast = parseAst(code)

    let propsKey
    let hasDefineProps

    visitAst(
      ast,
      {
        visitVariableDeclaration(path) {
          if (path.value?.declarations?.[0]?.init?.callee?.name === 'defineProps') {
            propsKey = path.value.declarations[0].id.name
            return false
          }

          return this.traverse(path)
        },
        visitCallExpression(path) {
          if ((path.node.callee as any).name) {
            hasDefineProps = true
            return false
          }
          return this.traverse(path)
        },
      },
    )

    if (add && hasDefineProps && !propsKey) {
      code = code.replace(
        /defineProps/g,
        () => {
          propsKey = '__$pProps'
          return 'const __$pProps = defineProps'
        },
      )
    }

    return { propsKey, code }
  }
  catch (e) {
    return undefined
  }
}
