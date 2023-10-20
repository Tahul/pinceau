export const pluginTypes = {
  imports: [
    'import type { ReactStyledComponentFactory } from \'@pinceau/react\'',
  ],
  global: [
    'export const $styled: { [Type in SupportedHTMLElements]: ReactStyledComponentFactory<Type> }',
  ],
  raw: [
  ],
}
