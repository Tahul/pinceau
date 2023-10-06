import type { Color } from 'vscode-languageserver/node'
import tinycolor2 from 'tinycolor2'

export function colorToVSCode(color: string): Color {
  const rgb = tinycolor2(color).toRgb()
  return { red: rgb.r, green: rgb.g, blue: rgb.b, alpha: rgb.a ?? 1 }
}
