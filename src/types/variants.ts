import type { CSSProperties } from './css'
import type { PinceauMediaQueries } from './theme'

export interface VariantOptions<T = any> {
  type?: string
  required?: boolean
  default?: T | { [key in PinceauMediaQueries]: T }
  mediaPrefix?: boolean
}

export interface BooleanVariant {
  true?: CSSProperties
  false?: CSSProperties
}

export interface EnumVariant {
  [key: string]: CSSProperties | VariantOptions
}

export interface ClassVariant {
  [key: string]: string | string[] | VariantOptions
}

export type Variant<T = { [key: string]: CSSProperties | VariantOptions<any> | string | string[] }> = (BooleanVariant | EnumVariant | ClassVariant) & { options?: VariantOptions<keyof T> }

export interface Variants {
  [key: string]: Variant
}
