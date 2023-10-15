export interface PinceauStyleOptions {
  /**
   * Excluded transform paths.
   */
  excludes: string[]

  /**
   * Included transform paths.
   */
  includes: string[]
}

export * from './css'
export * from './format-utils'
export * from './properties'
export * from './resolvers'
export * from './style-functions'
export * from './computed-styles'
export * from './variants'
export * from './dom-elements'
