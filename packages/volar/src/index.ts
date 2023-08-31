import type { VueLanguagePlugin } from '@volar/vue-language-core'
import { recomposeScriptSetup } from './vue/lang-ts-blocks'
import { pushVariantsProps } from './vue/variants'

const plugin: VueLanguagePlugin = _ => ({
  name: '@pinceau/volar',
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
  resolveEmbeddedFile(_, sfc, embeddedFile) {
    // Create css({ }) context
    const isCssInTsFile = embeddedFile.fileName.includes('.cssInTs.')
    if (isCssInTsFile) {
      recomposeScriptSetup(embeddedFile, sfc)
      return
    }

    // Add variants dynamic props
    const isPublicVueFile = embeddedFile.fileName.endsWith('.vue.ts')
    if (isPublicVueFile) {
      pushVariantsProps(embeddedFile, sfc)
    }
  },
})

export default plugin
