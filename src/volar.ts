import { defu } from 'defu'
import { camelCase } from 'scule'
import { hash } from 'ohash'
import type { VueLanguagePlugin } from '@volar/vue-language-core'
import { castVariantsPropsAst, evalCssDeclaration, resolveCssCallees, resolveVariantsProps } from './transforms'
import { printAst, propStringToAst } from './utils/ast'
import { dtRegex } from './utils/regexes'
import { fullCapabilities, resolveTemplateTags } from './utils/devtools'

const plugin: VueLanguagePlugin = _ => ({
  version: 1,
  resolveEmbeddedFile(fileName, sfc, embeddedFile) {
    // $dt helper
    const addDt = (match, dtKey, index, vueTag) => {
      if (!embeddedFile.content) { return }

      embeddedFile.content.push(`\nconst __VLS_$dt_${hash(`${camelCase(dtKey)}-${index}`)} = `)
      embeddedFile.content.push([
        match,
        vueTag,
        index,
        fullCapabilities,
      ])
      embeddedFile.content.push('\n')
    }

    // Handle <vue> files
    if (embeddedFile.fileName.replace(fileName, '').match(/^\.(js|ts|jsx|tsx)$/)) {
      // Add imports to <script setup>
      if (sfc.scriptSetup) {
        const imports = [
          '\nimport type { TokensFunction, CSS, PinceauTheme, PinceauThemePaths, TokensFunctionOptions, TokenOrThemeKey, MediaQueriesKeys } from \'pinceau\'\n',
          '\ntype __VLS_InstanceOmittedKeys = \'onVnodeBeforeMount\' | \'onVnodeBeforeUnmount\' | \'onVnodeBeforeUpdate\' | \'onVnodeMounted\' | \'onVnodeUnmounted\' | \'onVnodeUpdated\' | \'key\' | \'ref\' | \'ref_for\' | \'ref_key\' | \'style\' | \'class\'\n',
          `\ntype __VLS_PropsType = Omit<InstanceType<typeof import(\'${fileName}\').default>[\'$props\'], __VLS_InstanceOmittedKeys>\n`,
          '\nconst css = (declaration: CSS<PinceauTheme, __VLS_ComponentTemplateTags, __VLS_PropsType>) => ({ declaration })\n',
        ]
        embeddedFile.content.push(...imports)
      }

      let variants = {}

      // Grab `css()` function and type it.
      for (let i = 0; i < sfc.styles.length; i++) {
        const style = sfc.styles[i]
        const _variants = resolveStyleContent(embeddedFile, style, i, addDt)
        variants = defu(variants, _variants.variants)
      }

      if (sfc.template) {
        resolveTemplateTags(fileName, sfc, embeddedFile)
      }

      if (sfc.scriptSetup) {
        const isTs = sfc.scriptSetup.lang === 'ts'

        const variantProps = resolveVariantsProps(variants, isTs)

        let variantsPropsAst = propStringToAst(JSON.stringify({
          ...variantProps,
          // $variantsClass inference
          $variantsClass: { type: 'String', default: '', required: false, validator: () => false },
          // $dt inference
          $dt: { type: 'Function as PropType<(value: PinceauThemePaths) => string>', required: false, validator: () => false },
        }))

        variantsPropsAst = castVariantsPropsAst(variantsPropsAst)

        embeddedFile.content.push(`\nconst $variantsProps = ${printAst(variantsPropsAst).code}\n`)
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
    if (cssMatches) {
      embeddedFile.content.push('\nconst __VLS_css = ')
      embeddedFile.content.push([
        cssMatches[0],
        style.name,
        cssMatches.index,
        fullCapabilities,
      ])
    }

    // Type `$dt()` from <style>
    style.content.replace(
      dtRegex,
      (match, dtKey, index) => {
        addDt(match, dtKey, index, style.name, i)
        return match
      },
    )
  }

  return { variants }
}

export default plugin
