/**
 * Multiple identifiers for components running Pinceau runtime features.
 */
export interface PinceauRuntimeIds {
  uid: string
  componentId: string
  uniqueClassName?: string
}

/**
 * Runtime UID types
 */
export type PinceauUidTypes =
  /* Variants */
  | 'v'
  /* Computed Styles */
  | 'c'
  /* CSS Prop */
  | 'p'
