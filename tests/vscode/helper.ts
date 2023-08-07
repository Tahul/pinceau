/* --------------------------------------------------------------------------------------------
 * Copyright (c) Vu Nguyen. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'node:path'
import * as assert from 'node:assert'
import * as vscode from 'vscode'

let doc: vscode.TextDocument
let editor: vscode.TextEditor
let documentEol: string

export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const getDocPath = (p: string) => path.resolve(__dirname, '../fixtures/vscode', p)

export const getDocUri = (p: string) => vscode.Uri.file(getDocPath(p))

export async function activate(docUri: vscode.Uri) {
  // The extensionId is `publisher.name` from package.json
  const ext = vscode.extensions.getExtension(
    'tahul.pinceau-vscode',
  )!
  await ext.activate()
  try {
    doc = await vscode.workspace.openTextDocument(docUri)
    editor = await vscode.window.showTextDocument(doc)
    documentEol = doc.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n'
    await sleep(2000) // Wait for server activation
  }
  catch (e) {
    console.error(e)
  }
}

export async function setTestContent(content: string): Promise<void> {
  const all = new vscode.Range(
    doc.positionAt(0),
    doc.positionAt(doc.getText().length),
  )

  await editor.edit(eb => eb.replace(all, content))

  // HACK: Add a small delay to try and reduce the chance of a "Requested result
  // might be inconsistent with previously returned results" error.
  await sleep(300)
}

export function positionOf(
  searchText: string,
  doc?: vscode.TextDocument,
): vscode.Position {
  // Normalise search text to match the document, since our literal template
  // strings in tests end up compiled as only \n on Windows even thouh the
  // source file is \r\n!
  searchText = searchText.replace(/\r/g, '').replace(/\n/g, documentEol)
  const caretOffset = searchText.indexOf('^')
  assert.notStrictEqual(
    caretOffset,
    -1,
    `Couldn't find a ^ in search text (${searchText})`,
  )
  doc ??= vscode.window?.activeTextEditor?.document as vscode.TextDocument

  const docText = doc.getText()
  const matchedTextIndex = docText.indexOf(searchText.replace('^', ''))
  assert.notStrictEqual(
    matchedTextIndex,
    -1,
    `Couldn't find string ${searchText.replace(
      '^',
      '',
    )} in the document to get position of. Document contained:\n${docText}`,
  )

  return doc.positionAt(matchedTextIndex + caretOffset)
}
