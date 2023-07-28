import type { PinceauMediaQueries } from '@pinceau/theme'
import type { CSSProperties } from '@pinceau/style'

export interface VariantOptions<T = string> {
  type?: string
  required?: boolean
  default?: T | { [key in PinceauMediaQueries]?: T }
  mediaPrefix?: boolean
}

export interface BooleanVariant {
  true?: CSSProperties
  false?: CSSProperties
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
