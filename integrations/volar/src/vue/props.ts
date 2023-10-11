import { type Sfc, type VueEmbeddedFile } from '@volar/vue-language-core'
import { castVariantsPropsAst } from '@pinceau/vue/transforms'
import { printAst } from '@pinceau/core/utils'
import type { PinceauVolarFileContext } from '..'
import { stringsToUnionType } from '../utils'

export function recomposeProps(
  embeddedFile: VueEmbeddedFile,
  _: Sfc,
  ctx: PinceauVolarFileContext,
) {
  // Support local and used tokens autocompletion in :styled prop.
  if (ctx.localTokens.length || ctx.usedTokens.length) {
    const tokensUnion = stringsToUnionType([...ctx.localTokens, ...ctx.usedTokens])
    ctx.propsContent.push(`...{ styled: { type: [Object] as StyledProp<${tokensUnion}>, required: false } },\n`)
  }
  else {
    ctx.propsContent.push('...{ styled: { type: [Object] as StyledProp, required: false } },\n')
  }

  // Handle variants
  if (ctx.variantsProps && Object.keys(ctx.variantsProps).length) {
    // Cleanup variant props object
    for (const variant of Object.values(ctx.variantsProps) as any[]) {
      if (variant.possibleValues) { delete variant.possibleValues }
    }

    // Take resolved variantsObject ; turn it into AST ; cast it into props object ; print it as spreaded object
    ctx.propsContent.push(`...${printAst(castVariantsPropsAst(ctx.variantsProps)).code},\n`)
  }

  pushProps(embeddedFile, ctx.propsContent.join(''))
}

/**
 * Push props definition string in the correct context from a Volar embedded file.
 */
function pushProps(
  embeddedFile: VueEmbeddedFile,
  props: string,
) {
  // Find props block index (Volar pushes `props: {\n`)
  // Reference: https://github.com/wxsms/volar/blob/733e18894764863b1fc9411fb121e740e8f36ef8/packages/vue-code-gen/src/generators/script.ts#L255C3-L255C3
  const propsBlockIndex = embeddedFile.content.findIndex((content) => {
    const target = 'props: {\n'
    const stringContent = typeof content === 'string' ? content : content?.[0]
    if (stringContent === target) { return true }
    return false
  })
  if (propsBlockIndex !== -1) {
    embeddedFile.content.splice(propsBlockIndex + 1, 0, props)
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
  if (defineComponentBlockIndex !== -1) { embeddedFile.content.splice(defineComponentBlockIndex + 1, 0, `props: {\n ${props} \n},\n`) }
}
