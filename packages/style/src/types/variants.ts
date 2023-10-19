import type { RawCSS } from '@pinceau/style'
import type { PinceauMediaQueries } from '@pinceau/outputs/theme'

export interface VariantOptions<PropType = string | number> {
  type?: string
  required?: boolean
  default?: PropType | { [key in PinceauMediaQueries]?: PropType }
  mediaPrefix?: boolean
}

export type Variant<
  LocalTokens extends string | undefined = undefined,
  TemplateSource extends {} = {},
  > =
  {
    options?: VariantOptions
  }
  &
  {
    [key: string]: RawCSS<LocalTokens, TemplateSource, {}, true>
  }

export interface Variants<
  LocalTokens extends string | undefined = undefined,
  TemplateSource extends {} = {},
> {
  [key: string]: Variant<LocalTokens, TemplateSource>
}

export interface VariantsProps {
  [key: string]: string | boolean | { [key: string]: string | boolean }
}

/** Local testing purposes; this ain't exposed nor used anywhere */

// function variant<T extends {}>(declaration: Variant<T>) { return declaration as Readonly<T> }

// function variants<T extends {}>(declaration: Variants<T>) { return declaration as Readonly<T> }
