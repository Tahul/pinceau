export const pluginTypes = {
  imports: [
    'import \'svelte/elements\'',
    'import type { SvelteStyledComponentFactory } from \'@pinceau/svelte\'',
    'import { ResponsiveProp } from \'@pinceau/style\'',
    'import { StyledFunctionArg } from \'@pinceau/style\'',
  ],
  global: [
    'export type ResponsiveProp<T extends string | number | symbol | undefined> = ResponsiveProp<T>',
    'export type StyledProp = StyledFunctionArg',
    'export const $styled: { [Type in SupportedHTMLElements]: SvelteStyledComponentFactory<Type> }',
  ],
  raw: [
    'declare module \'svelte/elements\' { export interface DOMAttributes<T extends EventTarget> { styled?: StyledFunctionArg } }',
  ],
}
