export const pluginTypes = {
  imports: [
    'import type { VueStyledComponentFactory } from \'@pinceau/vue\'',
    'import { ResponsiveProp } from \'@pinceau/style\'',
    'import { StyledFunctionArg } from \'@pinceau/style\'',
    'import { PropType } from \'vue\'',
  ],
  global: [
    'export type ResponsiveProp<T extends string | number | symbol | undefined> = PropType<ResponsiveProp<T>>',
    'export type StyledProp = PropType<StyledFunctionArg>',
    'export const $styled: { [Type in SupportedHTMLElements]: VueStyledComponentFactory<Type> }',
  ],
  raw: [
    'declare module \'@vue/runtime-dom\' { interface HTMLAttributes { styled?: StyledFunctionArg } }',
  ],
}
