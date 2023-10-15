import { parse } from 'ultrahtml'
import { FileCapabilities, FileRangeCapabilities, type Sfc, type VueEmbeddedFile } from '@volar/vue-language-core'
import type { PinceauVolarFileContext } from '..'
import { stringsToUnionType } from '../utils'

export function recomposeScriptSetup(
  embeddedFile: VueEmbeddedFile,
  sfc: Sfc,
  ctx: PinceauVolarFileContext,
) {
  // Push imports
  embeddedFile.content.unshift('\nimport type { CSSFunctionArg, StyledFunctionArg } from \'@pinceau/style\'\n')

  // Add <script setup> context
  if (sfc?.scriptSetup) { embeddedFile.content.push(sfc.scriptSetup.content) }

  // Add template structure as local type for the cssInTs file
  const hasHtml = addHtmlStructure(embeddedFile, sfc)

  // Setup `css()` function context
  const localTokensType = ctx.localTokens.length
    ? stringsToUnionType(ctx.localTokens)
    : 'undefined'

  embeddedFile.content.push(`\nconst css = (declaration: CSSFunctionArg<${localTokensType}, ${hasHtml ? 'PinceauTemplateStructure' : '{}'}>) => { return declaration }\n`)

  embeddedFile.content.push(`\nconst styled = <Props = {}>(declaration: StyledFunctionArg<Props, ${localTokensType}, ${hasHtml ? 'PinceauTemplateStructure' : '{}'}, true>) => { return declaration }\n`)

  const index = Number(embeddedFile.fileName.split('.').slice(-2)[0])
  const style = sfc.styles[index]

  if (!style?.content) { return }

  embeddedFile.capabilities = FileCapabilities.full
  embeddedFile.kind = 1
  embeddedFile.content.push([
    style?.content,
    style?.name,
    0,
    FileRangeCapabilities.full,
  ])
}

function templateToObject(node) {
  const obj = {}

  // If the node has children, process them
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      if (child.name) {
        // Stop on slot
        if (child.name === 'slot') { continue }

        // Support .class attribute
        if (child.attributes.class) { obj[`.${child.attributes.class}`] = templateToObject(child) }

        // Support #id attribute
        if (child.attributes.id) { obj[`#${child.attributes.id}`] = templateToObject(child) }

        // If the child has a name, use it as a key in our object
        obj[child.name] = templateToObject(child)
      }
    }
  }

  return obj
}

function addHtmlStructure(embeddedFile: VueEmbeddedFile, sfc: Sfc) {
  const html = sfc?.template?.content || ''
  const parsedHtml = parse(html)
  const result = templateToObject(parsedHtml)
  embeddedFile.content.push(`\ntype PinceauTemplateStructure = ${JSON.stringify(result)}\n`)
  return !!Object.keys(result).length
}
