import { parseAst, visitAst } from '../../utils/ast'

export function transformAddPropsKey(code: string, add = true) {
  try {
    const ast = parseAst(code)

    let propsKey
    let hasDefineProps
    let hasWithDefaults

    visitAst(
      ast,
      {
        // Visit <script setup> variable declarations to find defineProps
        visitVariableDeclaration(path) {
          if (path.value?.declarations?.[0]?.init?.callee?.name === 'defineProps') {
            propsKey = path.value.declarations[0].id.name
            return false
          }
          return this.traverse(path)
        },
        visitCallExpression(path) {
          if ((path.node.callee as any).name === 'defineProps') {
            hasDefineProps = true
            return false
          }
          if ((path.node.callee as any).name === 'withDefaults') {
            hasWithDefaults = true
          }
          return this.traverse(path)
        },
      },
    )

    // No props key set; use Regex to add `const __$pProps = `
    if (add && hasDefineProps && !propsKey) {
      code = code.replace(
        /defineProps|withDefaults\(defineProps/,
        () => {
          propsKey = '__$pProps'
          return `const __$pProps = ${ hasWithDefaults ? "withDefaults(defineProps" : "defineProps" }`
        },
      )
    }

    return { propsKey, code }
  }
  catch (e) {
    return undefined
  }
}
