import type { ColorInformation } from 'vscode'
import type { PinceauExtension } from '../index'

export function registerColorHints(
  context: PinceauExtension,
) {
  const { connection, documents, documentReady, getDocumentSettings, getDocumentTokens, getStyleFunctions } = context

  connection.onDocumentColor(async (params): Promise<ColorInformation[]> => {
    await documentReady('🎨 onDocumentColor')

    const doc = documents.get(params.textDocument.uri)
    if (!doc) { return [] }

    const colors: ColorInformation[] = []

    const settings = await getDocumentSettings()

    const styleFns = getStyleFunctions(doc)

    getDocumentTokens(
      doc,
      styleFns,
      settings,
      ({ range, token }) => {
        const color = (token as any)?.color

        if (color) {
          colors.push({
            color: color?.$initial || color,
            range: range as any,
          })
        }
      },
    )

    return colors
  })

  connection.onColorPresentation(async (params) => {
    await documentReady('🎨 onColorPresentation')

    const document = documents.get(params.textDocument.uri)
    const className = document?.getText(params.range)

    if (!className) { return [] }

    return []
  })
}
