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
   * SSR support for server-side generated styles.
   */
  ssr: {
    /**
     * Should the `theme` sheet be SSRed.
     */
    theme: boolean
    /**
     * Should the `runtime` sheet be SSRed.
     */
    runtime: boolean
  }
}

export * from './plugin'
export * from './sheets'
