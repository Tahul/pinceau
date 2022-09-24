/** @type {import('@volar/vue-language-core').VueLanguagePlugin} */
const plugin = () => {
  return {

    getEmbeddedFileNames(fileName, sfc) {
      const names = []
      for (let i = 0; i < sfc.styles.length; i++) {
        const style = sfc.styles[i]
        if (style.lang === 'ts') {
          names.push(`${fileName}.style_ts_${i}.${style.lang}`)
        }
      }
      return names
    },

    resolveEmbeddedFile(fileName, sfc, embeddedFile) {
      const match = embeddedFile.fileName.match(/^(.*)\.style_ts_(\d+)\.([^.]+)$/)
      if (match) {
        const index = parseInt(match[2])
        const style = sfc.styles[index]

        embeddedFile.capabilities = {
          diagnostics: false,
          foldingRanges: false,
          formatting: true,
          documentSymbol: false,
          codeActions: false,
          inlayHints: false,
        }
        embeddedFile.isTsHostFile = false
        embeddedFile.codeGen.addCode2(
          style.content,
          0,
          {
            vueTag: style.tag,
            vueTagIndex: index,
            capabilities: {},
          },
        )
      }
    },
  }
}
module.exports = plugin
