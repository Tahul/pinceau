import type { VueLanguagePlugin } from '@volar/vue-language-core'
import { FileCapabilities } from '@volar/language-core'

const plugin: VueLanguagePlugin = _ => ({
  version: 1,
  getEmbeddedFileNames(fileName, sfc) {
    const fileNames: string[] = []
    for (let i = 0; i < sfc.styles.length; i++) {
      const style = sfc.styles[i]
      if (style.lang === 'ts') {
        fileNames.push(`${fileName}.cssInTs.${i}.ts`)
      }
    }
    return fileNames
  },
  resolveEmbeddedFile(fileName, sfc, embeddedFile) {
    if (embeddedFile.fileName.includes('.cssInTs.')) {
      // Add imports on top of file
      const content = [
        '\nimport type { CSSFunctionType, PinceauMediaQueries } from \'pinceau\'\n',
        '\nimport type { ExtractPropTypes } from \'vue\'\n',
        '\ntype __VLS_InstanceOmittedKeys = \'onVnodeBeforeMount\' | \'onVnodeBeforeUnmount\' | \'onVnodeBeforeUpdate\' | \'onVnodeMounted\' | \'onVnodeUnmounted\' | \'onVnodeUpdated\' | \'key\' | \'ref\' | \'ref_for\' | \'ref_key\' | \'style\' | \'class\'\n',
        `\ntype __VLS_PropsType = (Omit<InstanceType<typeof import('${fileName}').default>['$props'], __VLS_InstanceOmittedKeys>)\n`,
        '\nfunction css (declaration: CSSFunctionType<__VLS_PropsType>) { return { declaration } }\n',
      ]
      const index = Number(embeddedFile.fileName.split('.').slice(-2)[0])
      const style = sfc.styles[index]

      embeddedFile.capabilities = FileCapabilities.full
      embeddedFile.kind = 1
      embeddedFile.parentFileName = fileName
      embeddedFile.content.push(...content)
      embeddedFile.content.push([
        style.content,
        style.name,
        0,
        FileCapabilities.full,
      ])
    }
  },
})

export default plugin
