/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) Vu Nguyen. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */
import * as path from 'node:path'
import process from 'node:process'

import { runTests } from '@vscode/test-electron'

const dirname = path.dirname(import.meta.url)

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(dirname, '../../')

    // The path to test runner
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(dirname, './run-vscode-tests.js')

    const testWorkspace = path.resolve(dirname, '../fixtures/vscode')

    // Download VS Code, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [testWorkspace],
    })
  }
  catch (err) {
    console.error('Failed to run tests')
    process.exit(1)
  }
}

main()
