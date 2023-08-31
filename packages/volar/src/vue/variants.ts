import { type Sfc, type VueEmbeddedFile } from '@volar/vue-language-core'
import { castVariantsPropsAst, resolveVariantsProps } from '@pinceau/vue/transforms'
import { evalDeclaration, expressionToAst, findCallees, parseAst, printAst } from '@pinceau/core/utils'
import type { CSSFunctionArg } from '@pinceau/style'
import { defu } from 'defu'

export function pushVariantsProps(embeddedFile: VueEmbeddedFile, sfc: Sfc) {
  // Handle <vue> files
  let variantsContent: any
  let variantsAst: any

  // Resolve variants from SFC definition
  const variants = resolveVariantsContent(sfc)

  // Resolve variants props
  const variantProps = resolveVariantsProps({ state: { variants } } as any, true)
  if (variantProps && Object.keys(variantProps).length) {
    try {
      variantsAst = expressionToAst(JSON.stringify(variantProps))
      variantsContent = castVariantsPropsAst(variantsAst)
    }
    catch (e) {
      //
    }
  }

  // Stop if no variants found in file
  if (!variantsContent) { return }

  // Find props block index (Volar pushes `props: {\n`)
  // Reference: https://github.com/wxsms/volar/blob/733e18894764863b1fc9411fb121e740e8f36ef8/packages/vue-code-gen/src/generators/script.ts#L255C3-L255C3
  const propsBlockIndex = embeddedFile.content.findIndex((content) => {
    const target = 'props: {\n'
    const stringContent = typeof content === 'string' ? content : content?.[0]
    if (stringContent === target) { return true }
    return false
  })

  if (propsBlockIndex !== -1) {
    embeddedFile.content.splice(propsBlockIndex + 1, 0, `...${printAst(variantsContent).code}\n`)
    return
  }

  // No `defineProps` found, pushing raw props to defineComponent block instead
  // Volar exposes `__VLS_publicComponent` for other components to resolve the instance type
  // We can push the `props` object in that component safely, knowing it does not already exist for other components
  const defineComponentBlockIndex = embeddedFile.content.findIndex((content) => {
    const target = 'const __VLS_publicComponent = (await import(\'vue\')).defineComponent({\n'
    const stringContent = typeof content === 'string' ? content : content?.[0]
    if (stringContent === target) { return true }
    return false
  })
  if (defineComponentBlockIndex !== -1) {
    embeddedFile.content.splice(defineComponentBlockIndex + 1, 0, `props: {\n  ...${printAst(variantsContent).code}\n},\n`)
  }
}

function resolveVariantsContent(sfc: Sfc) {
  let variants = {}

  for (let i = 0; i < sfc.styles.length; i++) {
    const style = sfc.styles[i]

    try {
      // Check if <style> tag is `lang="ts"`
      if (style.lang === 'ts') {
        const ast = parseAst(style.content)
        const callees = findCallees(ast, 'css')

        for (let i = 0; i <= callees.length; i++) {
          const callee = callees[i]
          const ast = callee.value.arguments[0] as CSSFunctionArg
          const cssContent = evalDeclaration(ast)
          if (cssContent?.variants) { variants = defu(variants, cssContent?.variants) }
        }
      }
    }
    catch (e) {
      // Do not catch errors at this stage
    }
  }

  return variants
}
