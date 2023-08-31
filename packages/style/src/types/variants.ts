import type { PinceauMediaQueries } from '@pinceau/theme'
import type { CSSProperties } from '@pinceau/style'

export interface VariantOptions<T = {}> {
  type?: string
  required?: boolean
  default?: Exclude<keyof T, 'options'> | { [key in PinceauMediaQueries]?: Exclude<keyof T, 'options'> }
  mediaPrefix?: boolean
}

export type Variant<T> =
  {
    options?: VariantOptions<T>
  }
  &
  {
    [K in keyof T]?: K extends 'options' ? VariantOptions<T> : CSSProperties<T[K]> & { $class?: string }
  }

export type Variants<Source = {}> =
  {
    [Key in keyof Source]: Variant<Source[Key]>
  }

/** Local testing purposes; this ain't exposed nor used anywhere */
/* eslint-disable-next-line unused-imports/no-unused-vars */
function variant<T extends {}>(declaration: Variant<T>) { return declaration as Readonly<T> }
/* eslint-disable-next-line unused-imports/no-unused-vars */
function variants<T extends {}>(declaration: Variants<T>) { return declaration as Readonly<T> }
