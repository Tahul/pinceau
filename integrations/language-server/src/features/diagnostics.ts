import type { Diagnostic } from 'vscode-languageserver'
import type { TextDocument } from 'vscode-languageserver-textdocument'
import type { PinceauExtension } from '..'
import type { PinceauVSCodeSettings } from '../manager'

export function registerDiagnostics(
  context: PinceauExtension,
) {
  const { connection, tokensManager, documents, debugMessage, getDocumentSettings, getStyleFunctions, getDocumentTokens } = context

  function updateDocumentDiagnostics(
    doc: TextDocument,
    settings: PinceauVSCodeSettings,
  ) {
    const text = doc.getText()
    const diagnostics: Diagnostic[] = []
    const styleFunctions = getStyleFunctions(doc)

    getDocumentTokens(
      doc,
      styleFunctions,
      settings,
      ({ range, token, tokenPath, match, localToken }) => {
        if (!match.index) { return }

        if (tokensManager.initialized && (!token && !localToken) && !tokenPath.includes(' ') && text.charAt(match.index - 1) !== '$') {
          debugMessage(`🎨 Token not found: ${tokenPath}`)

          const settingsSeverity = (['error', 'warning', 'information', 'hint', 'disable'].indexOf(settings.missingTokenHintSeverity) + 1) as 1 | 2 | 3 | 4 | 5

          if (settingsSeverity === 5) { return }

          diagnostics.push({
            message: `🎨 Token '${tokenPath}' not found.`,
            range: {
              start: {
                character: range.start.character + 1,
                line: range.start.line,
              },
              end: {
                character: range.end.character + 1,
                line: range.start.line,
              },
            },
            severity: settingsSeverity,
            code: tokenPath,
          })
        }
      },
    )

    connection.sendDiagnostics({
      uri: doc.uri,
      version: doc.version,
      diagnostics,
    })
  }

  // Update diagnostics on document change
  documents.onDidChangeContent(async (params) => {
    const settings = await getDocumentSettings()
    updateDocumentDiagnostics(params.document, settings)
  })

  // Update diagnostics when watched file changes
  connection.onDidChangeWatchedFiles(async (_change) => {
    const settings = await getDocumentSettings()

    // Update all opened documents diagnostics
    const docs = documents.all()
    docs.forEach(doc => updateDocumentDiagnostics(doc, settings))
  })
}
