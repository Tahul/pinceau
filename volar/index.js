const { walkElementNodes } = require('@volar/vue-language-core')
const recast = require('recast')
const parser = require('recast/parsers/typescript')
const { defu } = require('defu')
const { camelCase } = require('scule')

/** @type {import('@volar/vue-language-core').VueLanguagePlugin} */
const plugin = _ => ({
  resolveEmbeddedFile(fileName, sfc, embeddedFile) {
    if (embeddedFile.fileName.replace(fileName, '').match(/^\.(js|ts|jsx|tsx)$/)) {
      embeddedFile.codeGen.addText('\nimport type { TokensFunction, CSS, PinceauTheme, PinceauThemePaths, TokensFunctionOptions, ThemeKey, MediaQueriesKeys } from \'pinceau\'\n')
      embeddedFile.codeGen.addText('\ntype __VLS_InstanceOmittedKeys = \'onVnodeBeforeMount\' | \'onVnodeBeforeUnmount\' | \'onVnodeBeforeUpdate\' | \'onVnodeMounted\' | \'onVnodeUnmounted\' | \'onVnodeUpdated\' | \'key\' | \'ref\' | \'ref_for\' | \'ref_key\' | \'style\' | \'class\'\n')
      embeddedFile.codeGen.addText(`\ntype __VLS_PropsType = Omit<InstanceType<typeof import(\'${fileName}\').default>[\'$props\'], __VLS_InstanceOmittedKeys>\n`)
      embeddedFile.codeGen.addText('\nconst css = (declaration: CSS<PinceauTheme, ComponentTemplateTags__VLS, __VLS_PropsType>) => ({ declaration })\n')
      embeddedFile.codeGen.addText('\nconst $dt = (path?: PinceauThemePaths, options?: TokensFunctionOptions) => ({ path, options })\n')
      embeddedFile.codeGen.addText('\nconst $variantsClass: string = \'\'\n')
      embeddedFile.codeGen.addText('\ndeclare global const $variantsClass: any\n')
      embeddedFile.codeGen.addText('\ndeclare global const $variantsProps: any\n')

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
        try {
          walkElementNodes(
            sfc.templateAst,
            ({ tag, props }) => {
              templateTags[`${props.class}`] = true
              templateTags[tag] = true
            },
          )
        }
        catch (e) {}
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

      let variants = {}

      // Grab `css()` function and type it.
      for (let i = 0; i < sfc.styles.length; i++) {
        const style = sfc.styles[i]

        try {
          if (style.lang === 'ts') {
            const ast = recast.parse(style.content, { parser })

            const declaration = resolveCssCallees(
              ast,
              (styleAst) => {
                const cssContent = resolveCssDeclaration(styleAst)

                if (cssContent.variants) { return cssContent.variants }

                return {}
              },
            )

            variants = defu(variants, declaration)
          }
        }
        catch (e) {
          // TODO
        }

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

      if (sfc.scriptSetup) {
        const isTs = sfc.scriptSetup.lang === 'ts'

        const variantPropsAst = resolveVariantsProps(variants, isTs)

        embeddedFile.codeGen.addText(`\nconst $variantsProps = ${recast.print(variantPropsAst).code}\n`)
      }
    }
  },
})

function propTypeStringToAst(type) {
  const parsed = recast.parse(`const toAst = ${type}`, { parser })
  const result = parsed.program.body[0].declarations[0].init
  return result
}

function resolveCssCallees(ast, cb) {
  let result = {}
  recast.visit(ast, {
    visitCallExpression(path) {
      if (path.value.callee.name === 'css') {
        result = defu(result, cb(path.value.arguments[0]))
      }
      return this.traverse(path)
    },
  })
  return result
}

function resolveVariantsProps(variants, isTs) {
  const props = {}

  Object.entries(variants).forEach(
    ([key, variant]) => {
      const prop = {
        required: false,
      }

      const isBooleanVariant = Object.keys(variant).some(key => (key === 'true' || key === 'false'))
      if (isBooleanVariant) {
        prop.type = ` [Boolean, Object]${isTs ? 'as PropType<boolean | ({ [key in MediaQueriesKeys]: boolean }) | ({ [key: string]: boolean })>' : ''}`
        prop.default = false
      }
      else {
        const possibleValues = `\'${Object.keys(variant).join('\' | \'')}\'`
        prop.type = ` [String, Object]${isTs ? ` as PropType<${possibleValues} | ({ [key in MediaQueriesKeys]: ${possibleValues} }) | ({ [key: string]: ${possibleValues} })>` : ''}`
        prop.default = undefined
      }

      if (variant?.options) {
        const options = variant?.options
        if (options.default) {
          prop.default = options.default
        }
        if (options.required) {
          prop.required = options.required
        }
      }

      props[key] = prop
    },
  )

  try {
    const _props = `const __$pVariantsProps = ${JSON.stringify(props)}`

    const propsAst = recast.parse(_props)

    recast.visit(
      propsAst,
      {
        visitProperty(path) {
          if (path.value?.key?.value === 'type') {
            path.value.value = propTypeStringToAst(path.value.value.value)
            return false
          }
          return this.traverse(path)
        },
      },
    )

    return propsAst.program.body[0].declarations[0].init
  }
  catch (e) {
    // TODO
  }

  return '\'\''
}

/**
 * Resolve computed styles found in css() declaration.
 */
function resolveCssDeclaration(ast) {
  // eslint-disable-next-line no-eval
  const _eval = eval

  // const transformed = transform({ source: recast.print(ast).code })
  _eval(`var cssDeclaration = ${recast.print(ast).code}`)

  // eslint-disable-next-line no-undef
  return cssDeclaration
}

module.exports = plugin
