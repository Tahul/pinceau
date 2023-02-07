import type { Sfc, VueLanguagePlugin } from '@volar/vue-language-core'
import { FileCapabilities, FileRangeCapabilities } from '@volar/language-core'
import { defu } from 'defu'
import { castVariantsPropsAst, evalCssDeclaration, resolveCssCallees, resolveVariantsProps } from './transforms'
import { expressionToAst, printAst } from './utils/ast'

const plugin: VueLanguagePlugin = _ => ({
  version: 1,
  getEmbeddedFileNames(fileName, sfc) {
    const fileNames: string[] = []
    for (let i = 0; i < sfc.styles.length; i++) {
      const style = sfc.styles[i]
      if (style.lang === 'ts' && style?.content) {
        fileNames.push(`${fileName}.cssInTs.${i}.ts`)
      }
    }
    return fileNames
  },
  resolveEmbeddedFile(fileName, sfc, embeddedFile) {
    const isCssInTsFile = embeddedFile.fileName.includes('.cssInTs.')

    // Handle <vue> files
    let variantsContent: any
    if (isCssInTsFile || embeddedFile.fileName.replace(fileName, '').match(/^\.(js|ts|jsx|tsx)$/)) {
      // Resolve variants from SFC definition
      const variants = resolveVariantsContent(sfc)

      // Resolve variants props
      if (sfc.scriptSetup) {
        const isTs = sfc.scriptSetup.lang === 'ts'
        const variantProps = resolveVariantsProps(variants, isTs)
        variantsContent = expressionToAst(JSON.stringify(variantProps))
        variantsContent = castVariantsPropsAst(variantsContent)
        variantsContent = `\nconst variants = ${printAst(variantsContent).code}\n`
      }
    }

    if (isCssInTsFile) {
      // Add variants above <script setup> content
      if (variantsContent) { embeddedFile.content.push(variantsContent) }

      // Add <script setup> context
      if (sfc.scriptSetup) {
        embeddedFile.content.push(sfc.scriptSetup.content)
      }

      // Setup `css()` context
      const context = [
        '\ntype OmittedKeysPinceau = \'onVnodeBeforeMount\' | \'onVnodeBeforeUnmount\' | \'onVnodeBeforeUpdate\' | \'onVnodeMounted\' | \'onVnodeUnmounted\' | \'onVnodeUpdated\' | \'key\' | \'ref\' | \'ref_for\' | \'ref_key\' | \'style\' | \'class\'\n',
        `\ntype PinceauProps = Omit<InstanceType<typeof import('${fileName}').default>['$props'], OmittedKeysPinceau>\n`,
        '\nfunction css (declaration: import(\'pinceau\').CSSFunctionType<PinceauProps>) { return { declaration } }\n',
      ]
      embeddedFile.content.push(...context)

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
    else if (variantsContent) {
      embeddedFile.content.push(variantsContent)
    }
  },
})

function resolveVariantsContent(sfc: Sfc) {
  let variants = {}

  for (let i = 0; i < sfc.styles.length; i++) {
    const style = sfc.styles[i]

    try {
      // Check if <style> tag is `lang="ts"`
      if (style.lang === 'ts') {
        resolveCssCallees(
          style.content,
          (styleAst) => {
            const cssContent = evalCssDeclaration(styleAst)
            if (cssContent?.variants) { variants = defu(variants, cssContent?.variants) }
          },
        )
      }
    }
    catch (e) {
      // Do not catch errors at this stage
    }
  }

  return variants
}

export default plugin
