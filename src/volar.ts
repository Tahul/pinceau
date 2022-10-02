import { defu } from 'defu'
import { camelCase } from 'scule'
import { hash } from 'ohash'
import type { VueLanguagePlugin } from '@volar/vue-language-core'
import { castVariantsPropsAst, evalCssDeclaration, resolveCssCallees, resolveVariantsProps } from './transforms'
import { printAst, propStringToAst } from './utils/ast'
import { dtRegex } from './utils/regexes'
import { fullCapabilities, resolveTemplateTags } from './utils/devtools'

const plugin: VueLanguagePlugin = _ => ({
  resolveEmbeddedFile(fileName, sfc, embeddedFile) {
    if (embeddedFile.fileName.replace(fileName, '').match(/^\.(js|ts|jsx|tsx)$/)) {
      embeddedFile.codeGen.addText('\nimport type { TokensFunction, CSS, PinceauTheme, PinceauThemePaths, TokensFunctionOptions, ThemeKey, MediaQueriesKeys } from \'pinceau\'\n')
      embeddedFile.codeGen.addText('\ntype __VLS_InstanceOmittedKeys = \'onVnodeBeforeMount\' | \'onVnodeBeforeUnmount\' | \'onVnodeBeforeUpdate\' | \'onVnodeMounted\' | \'onVnodeUnmounted\' | \'onVnodeUpdated\' | \'key\' | \'ref\' | \'ref_for\' | \'ref_key\' | \'style\' | \'class\'\n')
      embeddedFile.codeGen.addText(`\ntype __VLS_PropsType = Omit<InstanceType<typeof import(\'${fileName}\').default>[\'$props\'], __VLS_InstanceOmittedKeys>\n`)
      embeddedFile.codeGen.addText('\nconst css = (declaration: CSS<PinceauTheme, ComponentTemplateTags__VLS, __VLS_PropsType>) => ({ declaration })\n')
      embeddedFile.codeGen.addText('\nconst $dt = (path?: PinceauThemePaths, options?: TokensFunctionOptions) => ({ path, options })\n')
      embeddedFile.codeGen.addText(`\ndeclare module "${fileName}" { declare const $variantsClass: string }\n`)

      // $dt helper
      const addDt = (match, dtKey, index, vueTag, vueTagIndex) => {
        embeddedFile.codeGen.addText(`\nconst __VLS_$dt_${hash(`${camelCase(dtKey)}-${index}`)} = `)
        embeddedFile.codeGen.addCode2(
          match,
          index,
          {
            vueTag,
            vueTagIndex,
            capabilities: fullCapabilities,
          },
        )
        embeddedFile.codeGen.addText('\n')
      }

      let variants = {}

      // Grab `css()` function and type it.
      for (let i = 0; i < sfc.styles.length; i++) {
        const style = sfc.styles[i]
        const _variants = resolveStyleContent(embeddedFile, style, i, addDt)
        variants = defu(variants, _variants.variants)
      }

      if (sfc.template) {
        resolveTemplateTags(fileName, sfc, embeddedFile, addDt)
        sfc.template.content.replace(
          /\$variantsClass/g,
          (match, index) => {
            embeddedFile.codeGen.addCode2(
              match,
              index,
              {
                vueTag: 'template',
                vueTagIndex: 0,
                capabilities: {
                  basic: false,
                  completion: false,
                  definitions: false,
                  diagnostic: false,
                  displayWithLink: false,
                  references: false,
                  referencesCodeLens: false,
                  rename: false,
                  semanticTokens: false,
                },
              },
            )
            return match
          },
        )
      }

      if (sfc.scriptSetup) {
        const isTs = sfc.scriptSetup.lang === 'ts'

        const variantProps = resolveVariantsProps(variants, isTs)

        let variantsPropsAst = propStringToAst(JSON.stringify({ ...variantProps, $variantsClass: { type: 'String', default: '', required: false } }))

        variantsPropsAst = castVariantsPropsAst(variantsPropsAst)

        embeddedFile.codeGen.addText(`\nconst $variantsProps = ${printAst(variantsPropsAst).code}\n`)
      }
    }
  },
})

function resolveStyleContent(embeddedFile, style, i, addDt) {
  let variants = {}

  // Resolve variants
  try {
    if (style.lang === 'ts') {
      const declaration = resolveCssCallees(
        style.content,
        (styleAst) => {
          const cssContent = evalCssDeclaration(styleAst)

          if (cssContent.variants) { return cssContent.variants }

          return {}
        },
      )

      variants = defu(variants, declaration)
    }
  }
  catch (e) {
    //
  }

  // Type `css()`
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
          capabilities: fullCapabilities,
        },
      )
      embeddedFile.codeGen.addText('\n')
    }

    // Type `$dt()` from <style>
    if (dtMatches) {
      style.content.replace(
        dtRegex,
        (match, dtKey, index) => {
          addDt(match, dtKey, index, style.tag, i)
          return match
        },
      )
    }
  }

  return { variants }
}

export default plugin
