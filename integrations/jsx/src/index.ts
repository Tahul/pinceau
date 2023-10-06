import { StyledFunctionArg } from '@pinceau/style'
import type { PinceauJSXOptions } from './types'
import { SupportedHTMLElements } from '@pinceau/style'

export { version } from '../package.json'

export * from './types'

export type StyledReactComponent<E extends SupportedHTMLElements> = JSX.IntrinsicElements[E]

declare global {
  // $styled.a({ ... })
  const $styled: {
    [E in SupportedHTMLElements]: (<Props extends { [key: string]: any }>(declaration: StyledFunctionArg<Props>) => StyledReactComponent<E> )
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
