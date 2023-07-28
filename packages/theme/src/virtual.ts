import type { PinceauContext } from '@pinceau/core'
import { hmrFull, tsFull, utilsFull } from './outputs'

export function registerVirtualOutputs(ctx: PinceauContext) {
  const outputs = [
    ['pinceau.css', '/__pinceau_css.css', '/* This file is empty because no tokens has been provided or the configuration is broken. */'],
    ['#pinceau/theme', '/__pinceau_ts.ts', tsFull({})],
    ['#pinceau/utils', '/__pinceau_utils.ts', utilsFull({})],
    ['#pinceau/schema', '/__pinceau_schema.ts', 'export const schema = {}\n\export const GeneratedPinceauThemeSchema = typeof schema'],
    ['#pinceau/definitions', '/__pinceau_definitions.ts', 'export const definitions = {} as const'],
    ['#pinceau/hmr', '/__pinceau_hmr.ts', hmrFull()],
  ]

  outputs.forEach(([importPath, virtualPath, content]) => ctx.registerOutput(importPath, virtualPath, content))
}
