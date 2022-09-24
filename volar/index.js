const { walkElementNodes } = require('@volar/vue-language-core')
const { camelCase } = require('scule')

/** @type {import('@volar/vue-language-core').VueLanguagePlugin} */
const plugin = _ => ({
  resolveEmbeddedFile(fileName, sfc, embeddedFile) {
    if (embeddedFile.fileName.replace(fileName, '').match(/^\.(js|ts|jsx|tsx)$/)) {
      embeddedFile.codeGen.addText('\nimport type { TokensFunction, CSS, PinceauTheme, PinceauThemePaths, TokensFunctionOptions, ThemeKey } from \'pinceau\'\n')
      embeddedFile.codeGen.addText('\ntype __VLS_InstanceOmittedKeys = \'onVnodeBeforeMount\' | \'onVnodeBeforeUnmount\' | \'onVnodeBeforeUpdate\' | \'onVnodeMounted\' | \'onVnodeUnmounted\' | \'onVnodeUpdated\' | \'key\' | \'ref\' | \'ref_for\' | \'ref_key\' | \'style\' | \'class\'\n')
      embeddedFile.codeGen.addText(`\ntype __VLS_PropsType = Omit<InstanceType<typeof import(\'${fileName}\').default>[\'$props\'], __VLS_InstanceOmittedKeys>\n`)
      embeddedFile.codeGen.addText('\nconst css = (declaration: CSS<PinceauTheme, ComponentTemplateTags__VLS, __VLS_PropsType>) => ({ declaration })\n')
      embeddedFile.codeGen.addText('\nconst $dt = (path?: PinceauThemePaths, options?: TokensFunctionOptions) => ({ path, options })\n')
      embeddedFile.codeGen.addText('\nconst $variantsProps: (key: keyof ComponentTemplateTags__VLS) => ({ key })\n')

      // $dt helper
      const dtRegex = /\$dt\('(.*?)'\)/g
      const addDt = (match, dtKey, index, vueTag, vueTagIndex) => {
        embeddedFile.codeGen.addText(`\nconst __VLS_$dt_${camelCase(dtKey)}_${index} = `)
        embeddedFile.codeGen.addCode2(
          match,
          index,
          {
            vueTag,
            vueTagIndex,
            capabilities: {
              basic: true,
              formatting: true,
              referencesCodeLens: true,
              references: true,
              definitions: true,
              diagnostic: true,
              rename: true,
              completion: true,
              semanticTokens: true,
            },
          },
        )
        embeddedFile.codeGen.addText('\n')
      }

      // Add TemplateTags typings to autocomplete root in `css()`
      if (sfc.template && sfc.template.content) {
        const templateTags = {}
        walkElementNodes(
          sfc.templateAst,
          ({ tag, props }) => {
            templateTags[`${props.class}`] = true
            templateTags[tag] = true
          },
        )
        embeddedFile.codeGen.addText(`\ntype ComponentTemplateTags__VLS = {\n${Object.entries(templateTags).map(([tag]) => `  /**\n  * The \`<${tag}>\` tag from the Vue template.\n  */\n  ${tag}: true,\n`).join('')}}\n`)

        const templateDtMatches = sfc.template.content.match(dtRegex)
        if (templateDtMatches) {
          sfc.template.content.replace(
            dtRegex,
            (match, dtKey, index) => addDt(match, dtKey, index, sfc.template.tag),
          )
        }
      }
      else {
        embeddedFile.codeGen.addText('\ntype ComponentTemplateTags__VLS = {}\n')
      }

      // Grab `css()` function and type it.
      for (let i = 0; i < sfc.styles.length; i++) {
        const style = sfc.styles[i]

        if (style?.content) {
          const cssMatches = style.content.match(/css\(([\s\S]*)\)/)
          const dtMatches = style.content.match(dtRegex)

          if (cssMatches) {
            embeddedFile.codeGen.addText('\nconst __VLS_css = ')
            embeddedFile.codeGen.addCode2(
              cssMatches[0],
              cssMatches.index,
              {
                vueTag: 'style',
                vueTagIndex: i,
                capabilities: {
                  basic: true,
                  referencesCodeLens: true,
                  references: true,
                  definitions: true,
                  diagnostic: true,
                  rename: true,
                  completion: true,
                  semanticTokens: true,
                },
              },
            )
            embeddedFile.codeGen.addText('\n')
          }

          if (dtMatches) {
            style.content.replace(
              dtRegex,
              (match, dtKey, index) => addDt(match, dtKey, index, style.tag, i),
            )
          }
        }
      }
    }
  },
})
module.exports = plugin
