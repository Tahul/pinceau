import type { CSSProperties } from './css'
import type { PinceauMediaQueries } from './theme'

export interface VariantOptions<T = string> {
  type?: string
  required?: boolean
  default?: T | { [key in PinceauMediaQueries]?: T }
  mediaPrefix?: boolean
}

export interface BooleanVariant {
  true?: CSSProperties
  false?: CSSProperties
  [key: string]: CSSProperties
}

export interface EnumVariant {
  [key: string]: CSSProperties
}

export interface ClassVariant {
  [key: string]: string | (CSSProperties & { $class?: string })
}

export type Variant =
  (BooleanVariant | EnumVariant | ClassVariant)
  &
  {
    options?: VariantOptions
  }

export interface Variants {
  [key: string]: Variant
}
