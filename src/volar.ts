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
    if (embeddedFile.fileName.includes('.cssInTs.')) {
      // Add imports on top of file
      const imports = [
        '\nimport type { CSSFunctionType, PinceauMediaQueries } from \'pinceau\'\n',
        '\nimport type { ExtractPropTypes } from \'vue\'\n',
      ]

      const index = Number(embeddedFile.fileName.split('.').slice(-2)[0])
      const style = sfc.styles[index]

      if (!style?.content) { return }

      embeddedFile.capabilities = FileCapabilities.full
      embeddedFile.kind = 1
      embeddedFile.parentFileName = fileName
      if (sfc.scriptSetup) {
        embeddedFile.content.push([
          sfc.scriptSetup.content,
          sfc.scriptSetup.name,
          0,
          FileRangeCapabilities.full,
        ])
      }
      embeddedFile.content.push(...imports)
      embeddedFile.content.push([
        style?.content,
        style?.name,
        0,
        FileRangeCapabilities.full,
      ])

      return
    }

    // Handle <vue> files
    if (embeddedFile.fileName.replace(fileName, '').match(/^\.(js|ts|jsx|tsx)$/)) {
      // Resolve variants from SFC definition
      const variants = resolveVariantsContent(sfc)

      // Resolve variants props
      if (sfc.scriptSetup) {
        const isTs = sfc.scriptSetup.lang === 'ts'
        const variantProps = resolveVariantsProps(variants, isTs)
        let variantsPropsAst = expressionToAst(JSON.stringify(variantProps))
        variantsPropsAst = castVariantsPropsAst(variantsPropsAst)
        embeddedFile.content.push(`\nconst variants = ${printAst(variantsPropsAst).code}\n`)
      }
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
