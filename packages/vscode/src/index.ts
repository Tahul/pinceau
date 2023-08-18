/* --------------------------------------------------------------------------------------------
 * Copyright (c) Vu Nguyen. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path'
import vscode from 'vscode'
import type {
  LanguageClientOptions,
  ServerOptions,
} from 'vscode-languageclient/node'
import {
  LanguageClient,
  TransportKind,
} from 'vscode-languageclient/node'

let client: LanguageClient

export function activate(context: vscode.ExtensionContext) {
  // The server is implemented in node
  const serverModule = context.asAbsolutePath(path.join('dist', 'server.js'))

  // The debug options for the server
  // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
  const debugOptions = { execArgv: ['--nolazy', '--inspect=6099'] }

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  }

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      'onLanguage:astro',
      'onLanguage:svelte',
      'onLanguage:vue',
      'onLanguage:vue-html',
      'onLanguage:vue-postcss',
      'onLanguage:scss',
      'onLanguage:postcss',
      'onLanguage:less',
      'onLanguage:css',
      'onLanguage:html',
      'onLanguage:javascript',
      'onLanguage:javascriptreact',
      'onLanguage:typescript',
      'onLanguage:typescriptreact',
      'onLanguage:source.css.styled',
    ].map(event => ({
      scheme: 'file',
      language: event.split(':')[1],
    })),
    diagnosticCollectionName: 'pinceau',
    synchronize: {
      fileEvents: [
        vscode.workspace.createFileSystemWatcher('**/*/.nuxt/pinceau/index.ts'),
        vscode.workspace.createFileSystemWatcher('**/*/node_modules/.vite/pinceau/index.ts'),
        vscode.workspace.createFileSystemWatcher('**/*/.nuxt/pinceau/definitions.ts'),
        vscode.workspace.createFileSystemWatcher('**/*/node_modules/.vite/pinceau/definitions.ts'),
      ],
    },
  }

  // Create the language client and start the client.
  client = new LanguageClient(
    'pinceau',
    'Pinceau IntelliSense',
    serverOptions,
    clientOptions,
  )

  // Start the client. This will also launch the server
  client.start()
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) { return undefined }
  return client.stop()
}