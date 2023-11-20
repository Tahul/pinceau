import type { TextDocument } from 'vscode-languageserver-textdocument'

// import { parse as parseVueSFC } from '@vue/compiler-sfc'
import { REFERENCES_REGEX } from '@pinceau/core/runtime'
import type { DesignToken } from '@pinceau/theme'
import type { ColorInformation, Position, Range } from 'vscode-languageserver'
import { helperRegex } from '@pinceau/theme/utils'
import type { PinceauStyleFunctionContext } from '@pinceau/style'

// import { parsePinceauQuery } from '@pinceau/core/utils'
import type { PinceauVSCodeSettings } from '../manager'
import type PinceauTokensManager from '../manager'
import { findAll } from '../utils/findAll'
import { indexToPosition } from '../utils/indexToPosition'
import { getCurrentLine } from '../utils/getCurrentLine'
import { getHoveredThemeFunction, getHoveredToken } from '../utils/getHoveredToken'
import { findStringRange } from '../utils/findStringRange'

export function setupTokensHelpers(
  tokensManager: PinceauTokensManager,
) {
  /**
   * Returns a parsed Vue component data.
   */
  function getStyleFunctions(
    doc: TextDocument,
  ): PinceauStyleFunctionContext[] {
    const version = doc.version
    const transformCache = tokensManager.getTransformCache()
    const cachedTransform = transformCache.get('parsed', doc.uri)
    const styleFns: PinceauStyleFunctionContext[] = []

    try {
      if (cachedTransform?.version === doc.version) { return cachedTransform }

      // const query = parsePinceauQuery(doc.uri)

      // const parsed = parseVueSFC(doc.getText())

      // console.log({ query, parsed })

      const data = { version }

      tokensManager.getTransformCache().set(doc.uri, 'parsed', data)
    }
    catch (e) {
      console.log({ e })
    }

    return styleFns
  }

  /**
   * Get all the tokens from the document and call a callback on it.
   */
  function getDocumentTokens(
    doc: TextDocument,
    _styleFns?: PinceauStyleFunctionContext[],
    settings?: PinceauVSCodeSettings,
    onToken?: (token: { match: RegExpMatchArray, tokenPath: string, range: Range, settings?: PinceauVSCodeSettings, token?: DesignToken, localToken?: any }) => void,
  ) {
    const colors: ColorInformation[] = []

    const text = doc.getText()
    const dtMatches = findAll(helperRegex('$theme'), text)
    const tokenMatches = findAll(REFERENCES_REGEX, text)

    const globalStart: Position = { line: 0, character: 0 }

    for (const match of [...dtMatches, ...tokenMatches]) {
      const tokenPath = match[1]
      // const varName = pathToVarName(tokenPath)
      const start = indexToPosition(text, match?.index || 0)
      const end = indexToPosition(text, (match?.index || 0) + tokenPath.length)

      // const localToken = tokensData?.localTokens?.[varName]

      const token = tokensManager.getAll().get(tokenPath)

      const range = {
        start: {
          line: globalStart.line + start.line,
          character: (end.line === 0 ? globalStart.character : 0) + start.character,
        },
        end: {
          line: globalStart.line + end.line,
          character: (end.line === 0 ? globalStart.character : 0) + end.character,
        },
      }

      onToken?.({
        match,
        tokenPath,
        token,
        // localToken,
        range,
        settings,
      })
    }

    return colors
  }

  /**
   * Get the closest token starting from a cursor position.
   *
   * Useful for hover/definition.
   */
  function getClosestToken(
    doc: TextDocument,
    position: Position,
  ) {
    const toRet: {
      delimiter: string
      currentLine?: { text: string, range: { start: number, end: number } }
      currentToken?: { token: string, range: { start: number, end: number } }
      closestToken?: any
      token?: any
      localToken?: any
      lineRange?: { start: number, end: number }
    } = {
      delimiter: '$',
      currentToken: undefined,
      currentLine: undefined,
      closestToken: undefined,
      localToken: undefined,
      token: undefined,
      lineRange: undefined,
    }

    toRet.currentLine = getCurrentLine(doc, position)
    if (!toRet.currentLine) { return }

    // Try to grab `$token.path` syntax
    toRet.currentToken = getHoveredToken(doc, position)

    // Try to grab `$theme('token.path')` syntax
    if (!toRet.currentToken) {
      toRet.currentToken = getHoveredThemeFunction(doc, position)
      if (toRet.currentToken) { toRet.delimiter = '$theme(' }
    }

    // No syntax found
    if (!toRet.currentToken) { return toRet }

    // Get from local component tokens
    // toRet.localToken = tokensData?.localTokens?.[pathToVarName(toRet.currentToken.token)]

    toRet.token = tokensManager.getAll().get(toRet.currentToken.token)

    // Try to resolve from parent token
    if (!toRet.localToken && !toRet?.token?.definitions) {
      let currentTokenPath = toRet.currentToken.token.split('.')
      while (currentTokenPath.length) {
        toRet.currentToken.token = currentTokenPath.join('.')
        toRet.closestToken = tokensManager.getAll().get(toRet.currentToken.token)
        if (toRet.closestToken) { currentTokenPath = [] }
        currentTokenPath = currentTokenPath.splice(1)
      }
    }

    toRet.lineRange = findStringRange(toRet.currentLine.text, toRet.currentToken.token, position, toRet.delimiter)

    return toRet
  }

  return {
    getClosestToken,
    getStyleFunctions,
    getDocumentTokens,
  }
}
