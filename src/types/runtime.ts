export interface PinceauRuntimeIds {
  uid: string
  componentId: string
  uniqueClassName?: string
}

export type PinceauUidTypes =
  /* Variants */
  | 'v'
  /* Computed Styles */
  | 'c'
  /* CSS Prop */
  | 'p'
