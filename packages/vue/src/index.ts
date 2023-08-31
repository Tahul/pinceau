import type { CSSProperties as PinceauCSSProperties } from '@pinceau/style'

export * from './types'

declare module '@vue/runtime-dom' {
  interface HTMLAttributes {
    styled?: PinceauCSSProperties<{}>
  }
}
