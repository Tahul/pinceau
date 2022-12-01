import type { CSSProperties } from './css'
import type { PinceauMediaQueries } from './theme'

export interface VariantOptions<T> {
  type?: string
  required?: boolean
  default?: T | { [key in PinceauMediaQueries]: T }
}

export type Variant<T = { [key: string]: CSSProperties | VariantOptions<any> }> = T & { options?: VariantOptions<keyof T> }

export interface Variants {
  [key: string]: Variant
}
