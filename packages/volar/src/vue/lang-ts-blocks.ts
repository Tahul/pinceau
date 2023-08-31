import { parse } from 'ultrahtml'
import { FileCapabilities, FileRangeCapabilities, type Sfc, type VueEmbeddedFile } from '@volar/vue-language-core'

export function recomposeScriptSetup(embeddedFile: VueEmbeddedFile, sfc: Sfc) {
  // Push imports
  embeddedFile.content.unshift('\nimport type { CSS } from \'@pinceau/style\'')

  // Add <script setup> context
  if (sfc.scriptSetup) { embeddedFile.content.push(sfc.scriptSetup.content) }

  // Add template structure as local type for the cssInTs file
  const hasHtml = addHtmlStructure(embeddedFile, sfc)

  // Setup `css()` function context
  embeddedFile.content.push(`\ndeclare global { function css <T>(declaration: CSS<T, ${hasHtml ? 'PinceauTemplateStructure' : 'any'}>): string }\n`)

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

        // Support class attribute
        if (child.attributes.class) { obj[`.${child.attributes.class}`] = templateToObject(child) }

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
  embeddedFile.content.push(`\nconst templateStructure = ${JSON.stringify(result)}\n\ntype PinceauTemplateStructure = typeof templateStructure\n`)
  return !!Object.keys(result).length
}
