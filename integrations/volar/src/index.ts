import type { VueLanguagePlugin } from '@volar/vue-language-core'
import { recomposeScriptSetup } from './vue/lang-ts-blocks'
import { recomposeProps } from './vue/props'
import { resolveEmbeddedFileContext } from './resolve'

export interface PinceauVolarFileContext {
  localTokens: string[]
  usedTokens: string[]
  propsContent: string[]
  variantsObject: any
  variantsProps: any
}

const plugin: VueLanguagePlugin = _ => ({
  name: '@pinceau/volar',
  version: 1,
  getEmbeddedFileNames(fileName, sfc) {
    const fileNames: string[] = []
    for (let i = 0; i < sfc.styles.length; i++) {
      const style = sfc.styles[i]
      if (style.lang === 'ts' && style?.content) { fileNames.push(`${fileName}.cssInTs.${i}.ts`) }
    }
    return fileNames
  },
  resolveEmbeddedFile(_, sfc, embeddedFile) {
    const ctx: PinceauVolarFileContext = {
      localTokens: [],
      usedTokens: [],
      propsContent: [],
      variantsObject: undefined,
      variantsProps: undefined,
    }

    const isPublicVueFile = embeddedFile.fileName.endsWith('.vue.ts')
    const isCssInTsFile = embeddedFile.fileName.includes('.cssInTs.')

    if (!isPublicVueFile && !isCssInTsFile) { return }

    // Grab block index
    let i = 0
    if (isCssInTsFile) { i = Number(embeddedFile.fileName.split('.cssInTs.')[1].split('.')[0]) }

    resolveEmbeddedFileContext(sfc, ctx, i)

    // Add variants dynamic props
    if (isPublicVueFile) { recomposeProps(embeddedFile, sfc, ctx) }

    // Create css({ }) context
    if (isCssInTsFile) { recomposeScriptSetup(embeddedFile, sfc, ctx) }
  },
})

export default plugin
