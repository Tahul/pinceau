import type { Position, TextDocument } from 'vscode-languageserver-textdocument'
import type { PinceauStyleFunctionContext } from '@pinceau/style'
import { getCurrentLine } from './getCurrentLine'
import { isInFunctionExpression } from './isInFunctionExpression'
import { isInString } from './isInString'

/**
 * Get the context of the current cursor position.
 *
 * Useful for completions
 */
export function getCursorContext(
  doc: TextDocument,
  position: Position,
  styleFns: PinceauStyleFunctionContext[],
) {
  const offset = doc.offsetAt(position)
  const currentLine = getCurrentLine(doc, position)

  const isTokenFunctionCall = currentLine ? isInFunctionExpression(currentLine.text, position) : false
  const currentStyleTag = styleFns.find(styleBlock => (offset >= styleBlock.loc.start.offset && offset <= styleBlock.loc.end.offset))
  const isInStringExpression = currentLine ? isInString(currentLine.text, position) : false

  return {
    position,
    currentLine,
    isTokenFunctionCall,
    isOffsetOnStyleTsTag: !!currentStyleTag,
    isInStringExpression,
  }
}
