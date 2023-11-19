import type { CompletionItem, TextDocumentPositionParams } from 'vscode-languageserver'
import type { PinceauExtension } from '..'

export function registerCompletion(
  context: PinceauExtension,
) {
  const { connection, documents, documentReady } = context

  // This handler provides the initial list of the completion items.
  connection.onCompletion(async (textDocumentPosition: TextDocumentPositionParams): Promise<CompletionItem[]> => {
    await documentReady('✅ onCompletion')

    const doc = documents.get(textDocumentPosition.textDocument.uri)
    if (!doc) { return [] }

    // const styleFns = getStyleFunctions(doc)

    // const { isInStringExpression, isOffsetOnStyleTsTag, isTokenFunctionCall } = getCursorContext(doc, textDocumentPosition.position, styleFns)

    // Create completion symbols
    const items: CompletionItem[] = []

    /*
    if (isTokenFunctionCall || ((doc.uri.includes('theme.config.ts') || isOffsetOnStyleTsTag) && isInStringExpression)) {
      Object.entries(tokensData?.localTokens || {}).forEach(
        ([key, localToken]: [string, any]) => {
          const path = key.replace(/^--/, '').split('-').join('.')
          const completion: CompletionItem = {
            label: path,
            detail: printAst(localToken).code,
            insertText: `$${path}`,
            kind: CompletionItemKind.EnumMember,
            sortText: `z${path}`,
          }
          items.push(completion)
        },
      )
      tokensManager.getAll().forEach((token: any) => {
        if (!token?.name || !token?.value) { return }

        const insertText = isTokenFunctionCall ? token?.name : `$${token.name}`

        const originalString = stringifiedValue({ value: token?.original })
        const configValue = originalString ? `🎨 Config value:\n${originalString}` : undefined
        const stringValue = stringifiedValue(token)
        const sourcePath = token?.definition?.uri.replace(rootPath || '', '')
        const source = sourcePath ? `📎 Source:\n${sourcePath}` : ''

        const completion: CompletionItem = {
          label: token?.name,
          detail: stringValue?.split?.('\n')?.[0],
          documentation: `${configValue}${sourcePath ? `\n\n${source}` : ''}`,
          insertText,
          kind: CompletionItemKind.Color,
          sortText: `z${token?.name}`,
        }

        items.push(completion)
      })
    }
    */

    return items
  },
  )

  // This handler resolves additional information for the item selected in the completion list.
  connection.onCompletionResolve((item: CompletionItem): CompletionItem => item)
}
