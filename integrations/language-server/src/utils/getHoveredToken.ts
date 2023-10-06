import type { Position, TextDocument } from 'vscode-languageserver-textdocument'
import { helperRegex } from '@pinceau/theme/utils'
import { getCurrentLine } from './getCurrentLine'

function findClosestChar(
  source: string,
  char: string | string[],
  position: number,
): number | -1 {
  let before = position - 1
  let after = position
  while (before >= 0 || after < source.length) {
    if (Array.isArray(char) ? char.includes(source[before]) : (source[before] === char)) {
      return before
    }
    if (Array.isArray(char) ? char.includes(source[after]) : (source[after] === char)) {
      return after
    }
    before--
    after++
  }
  return -1
}

export function getHoveredToken(doc: TextDocument, position: Position): { token: string; range: { start: number; end: number } } | undefined {
  const line = getCurrentLine(doc, position)
  if (!line) { return }
  const startIndex = findClosestChar(line.text, '$', position.character)
  const endIndex = findClosestChar(line.text, [' ', '\'', '\`', '\"', ','], position.character)
  if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) { return }
  return {
    token: line.text.substring(startIndex + 1, endIndex),
    range: {
      start: line.range.start + startIndex + 1,
      end: line.range.start + (endIndex - startIndex),
    },
  }
}

export function getHoveredThemeFunction(doc: TextDocument, position: Position): { token: string; range: { start: number; end: number } } | undefined {
  const line = getCurrentLine(doc, position)
  if (!line) { return }
  const startIndex = line.text.lastIndexOf('$theme(', position.character)
  let endIndex = line.text.indexOf(')', position.character)
  if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) { return }
  endIndex = endIndex + 1
  const matches = helperRegex('$theme').exec(line.text.substring(startIndex, endIndex))
  return {
    token: matches?.[1] as string,
    range: {
      start: line.range.start + startIndex,
      end: line.range.start + (endIndex - startIndex),
    },
  }
}
