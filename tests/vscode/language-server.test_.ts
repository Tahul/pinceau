import * as path from 'node:path'
import { PinceauTokensManager } from '@pinceau/language-server'
import { describe, expect, test } from 'vitest'

describe('CSS Variable Manager', () => {
  test('can parse variables from css files', async () => {
    const tokensManager = new PinceauTokensManager()

    await tokensManager.syncTokens(
      [path.resolve(__dirname, '../fixtures/theme/index.css')],
      { debug: true, missingTokenHintSeverity: 'error', buildDirs: [path.join(__dirname, '../fixtures/pinceau')] },
    )

    const allTokens = tokensManager.getAll()

    expect(allTokens.get('color.white')?.value).toEqual('#FFFFFF')
    expect(allTokens.get('color.black')?.value).toEqual('#191919')
  })
})
