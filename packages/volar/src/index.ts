import type { Sfc, VueLanguagePlugin } from '@volar/vue-language-core'
import { FileCapabilities, FileRangeCapabilities } from '@volar/language-core'
import { defu } from 'defu'
import { expressionToAst, printAst } from '@pinceau/core/utils'
import { evalCSSDeclaration, resolveCSSCallees } from '@pinceau/style/utils'
import { castVariantsPropsAst, resolveVariantsProps } from '@pinceau/vue/transforms'
import type { ASTNode } from 'ast-types'

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
        const variantProps = resolveVariantsProps({ variants } as any, isTs)
        if (variantProps && Object.keys(variantProps).length) {
          variantsContent = expressionToAst(JSON.stringify(variantProps))
          variantsContent = castVariantsPropsAst(variantsContent)
          variantsContent = `\nconst variants = ${printAst(variantsContent).code}\n`
        }
      }
    }

    if (isCssInTsFile) {
      // Push imports
      embeddedFile.content.unshift('\nimport type { CSS } from \'pinceau\'')

      // Add variants above <script setup> content
      if (variantsContent) { embeddedFile.content.push(variantsContent) }

      // Add <script setup> context
      if (sfc.scriptSetup) { embeddedFile.content.push(sfc.scriptSetup.content) }

      // Setup `css()` context
      const context = [
        '\nfunction css <T>(declaration: CSS<T>) { return declaration as Readonly<T> }\n',
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
        const callees = resolveCSSCallees(style.content)

        for (let i = 0; i <= callees.length; i++) {
          const cssContent = evalCSSDeclaration(callees[i] as any as ASTNode)
          if (cssContent?.variants) { variants = defu(variants, cssContent?.variants) }
        }
      }
    }
    catch (e) {
      // Do not catch errors at this stage
    }
  }

  return variants
}

export default plugin
