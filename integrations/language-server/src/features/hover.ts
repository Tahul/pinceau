import { printAst } from '@pinceau/core/utils'
import type { PinceauExtension } from '../index'
import { stringifiedValue } from '../utils/tokens'

export function registerHover(
  context: PinceauExtension,
) {
  const { connection, documentReady, documents, getClosestToken } = context

  connection.onHover(async (params) => {
    await documentReady('📘 onHover')

    const doc = documents.get(params.textDocument.uri)
    if (!doc) { return }

    const closestToken = getClosestToken(doc, params.position)

    if (!closestToken) { return }

    const { localToken, token } = closestToken

    if (localToken) { return { contents: `📍 \`\`\`\n${printAst(localToken).code}\n\`\`\``, code: '', message: '', data: {}, name: '' } }

    if (token) { return { contents: `🎨 ${stringifiedValue(token)}`, code: '', message: '', data: {}, name: '' } }
  })
}
