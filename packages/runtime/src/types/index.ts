export interface PinceauRuntimeOptions {
  /**
   * App id used to identify this app if multiple Pinceau instances runs at the same time.
   *
   * Setting it to a string enables the multi-app feature.
   */
  appId: string | false
  /**
   * Toggles Variants feature.
   */
  variants: boolean
  /**
   * Toggles Computed Styles feature.
   */
  computedStyles: boolean
  /**
   * Toggles cssProp feature.
   */
  cssProp: boolean
  /**
   * SSR support for server-side generated styles.
   */
  ssr: boolean
}

export * from './ids'
export * from './options'
export * from './rules'
export * from './sheets'
export * from './variants'
