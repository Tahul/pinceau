import type { StyledFunctionArg, SupportedHTMLElements } from '@pinceau/style'
import type { PinceauJSXOptions } from './types'

export { version } from '../package.json'

export * from './types'

export type StyledComponentFactory<Type extends SupportedHTMLElements> = <Props extends Record<string, any>>(declaration: StyledFunctionArg<{}, Props, (string & {}), {}, false>) => StyledReactComponent<Type, Props>

export type StyledReactComponent<
  Type extends SupportedHTMLElements,
  Props extends Record<string, any> = {},
> =
  React.FC<
    JSX.IntrinsicElements[Type]
    &
    Props
  >

declare global {
  // $styled.a({ ... })
  const $styled: {
    [Type in SupportedHTMLElements]: StyledComponentFactory<Type>
  }
}

declare module '@pinceau/core' {
  interface PinceauPluginsOptions {
    /**
     * Pinceau JSX options.
     *
     * Using `true` will use default options for JSX transforms.
     *
     * Using `false` will completely disable JSX support.
     */
    jsx: Partial<PinceauJSXOptions> | boolean
  }
}
