import type { CSSProperties, MappedProperty } from './css'
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

export interface ClassVariant<ComponentProps = {}> {
  [key: string]:
  | string
  | string[]
  | VariantOptions
  | Record<string, { $class?: string[] } & { [k: string]: { [K in string]: CSSProperties<ComponentProps> | MappedProperty<K, ComponentProps> | {} } | string | string[] }>
}

export type Variant<
  ComponentProps = {},
  T = { [key: string]: CSSProperties | VariantOptions<any> | string | string[] },
> =
  (BooleanVariant | EnumVariant | ClassVariant<ComponentProps>) &
  {
    options?: VariantOptions<keyof T | string | number | boolean>
  }

export interface Variants<ComponentProps = {}> {
  [key: string]: Variant<ComponentProps>
}
