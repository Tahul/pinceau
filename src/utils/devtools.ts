import type { EmbeddedFile, Sfc } from '@volar/vue-language-core'
import { walkElementNodes } from '@volar/vue-language-core'
import { dtRegex, variantsClassRegex } from './regexes'

export const fullCapabilities = {
  basic: true,
  referencesCodeLens: true,
  references: true,
  definitions: true,
  diagnostic: true,
  rename: true,
  completion: true,
  semanticTokens: true,
}

export function resolveTemplateTags(fileName: string, sfc: Sfc, embeddedFile: EmbeddedFile, addDt) {
  // Add TemplateTags typings to autocomplete root in `css()`
  if (sfc.template && sfc.template.content) {
    const templateTags = {}
    try {
      walkElementNodes(
        sfc.templateAst,
        ({ tag }) => {
          templateTags[tag] = true
        },
      )
    }
    catch (e) {
      //
    }

    embeddedFile.codeGen.addText(`\ntype ComponentTemplateTags__VLS = {\n${Object.entries(templateTags).map(([tag]) => `  /**\n  * The \`<${tag}>\` tag from the Vue template.\n  */\n  ${tag}: true,\n`).join('')}}\n`)

    const templateDtMatches = sfc.template.content.match(dtRegex)
    if (templateDtMatches) {
      sfc.template.content.replace(
        dtRegex,
        (match, dtKey, index) => {
          addDt(match, dtKey, index, sfc.template.tag, 0)
          return match
        },
      )
    }
  }
  else {
    embeddedFile.codeGen.addText('\ntype ComponentTemplateTags__VLS = {}\n')
  }
}
