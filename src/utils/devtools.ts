import type { Sfc, VueEmbeddedFile } from '@volar/vue-language-core'
import { walkElementNodes } from '@volar/vue-language-core'
import { dtRegex } from './regexes'

export const fullCapabilities = {
  completion: true,
  definition: true,
  diagnostic: true,
  hover: true,
  references: true,
  rename: true,
  semanticTokens: true,
}

export function resolveTemplateTags(fileName: string, sfc: Sfc, embeddedFile: VueEmbeddedFile, addDt) {
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
    catch (e) {
      //
    }

    embeddedFile.content.push(`\ntype __VLS_ComponentTemplateTags = {\n${Object.entries(templateTags).map(([tag]) => `  /**\n  * The \`<${tag}>\` tag from the Vue template.\n  */\n  ${tag}: true,\n`).join('')}}\n`)

    const templateDtMatches = sfc.template.content.match(dtRegex)
    if (templateDtMatches) {
      sfc.template.content.replace(
        dtRegex,
        (match, dtKey, index) => {
          addDt(match, dtKey, 0, sfc.template.name, index)
          return match
        },
      )
    }
  }
  else {
    embeddedFile.content.push('\ntype __VLS_ComponentTemplateTags = {}\n')
  }
}
