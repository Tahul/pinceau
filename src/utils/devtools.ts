import type { Sfc, VueEmbeddedFile } from '@volar/vue-language-core'
import { walkElementNodes } from '@volar/vue-language-core'

export const fullCapabilities = {
  completion: true,
  definition: true,
  diagnostic: true,
  hover: true,
  references: true,
  rename: true,
  semanticTokens: true,
}

export function resolveTemplateTags(_: string, sfc: Sfc, embeddedFile: VueEmbeddedFile) {
  // Add TemplateTags typings to autocomplete root in `css()`
  if (sfc.template && sfc.template.content) {
    const templateTags = {}
    try {
      walkElementNodes(
        sfc.getTemplateAst(),
        ({ tag }) => {
          templateTags[tag] = true
        },
      )
    }
    catch (e) {}
    embeddedFile.content.push(`\ntype __VLS_ComponentTemplateTags = {\n${Object.entries(templateTags).map(([tag]) => `  /**\n  * The \`<${tag}>\` tag from the Vue template.\n  */\n  ${tag}: true,\n`).join('')}}\n`)
  }
  else {
    embeddedFile.content.push('\ntype __VLS_ComponentTemplateTags = {}\n')
  }
}
