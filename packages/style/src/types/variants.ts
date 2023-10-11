import type { CSSProperties, RawCSS } from '@pinceau/style'
import type { GeneratedPinceauMediaQueries as PinceauMediaQueries } from '$pinceau/theme'

export interface VariantOptions<T = {}> {
  type?: string
  required?: boolean
  default?: Exclude<keyof T, 'options'> | { [key in PinceauMediaQueries]?: Exclude<keyof T, 'options'> }
  mediaPrefix?: boolean
}

export type Variant<
  T extends Record<string, CSSProperties> = {},
  LocalTokens extends string | undefined = undefined,
  TemplateSource extends {} = {},
  > =
(
  {
    options?: VariantOptions<T>
  }
)
|
{
  [K in keyof T]?: K extends 'options' ? VariantOptions<T> : RawCSS<LocalTokens, TemplateSource, {}, true> & { $class?: string }
}

export type Variants<
  Source extends Record<string, {}> = {},
  LocalTokens extends string | undefined = undefined,
  TemplateSource extends {} = {},
> = {
  [Key in keyof Source]: Variant<
      Source[Key],
      LocalTokens,
      TemplateSource
    >
}

export interface VariantsProps {
  [key: string]: string | boolean | { [key: string]: string | boolean }
}

/** Local testing purposes; this ain't exposed nor used anywhere */

// function variant<T extends {}>(declaration: Variant<T>) { return declaration as Readonly<T> }

// function variants<T extends {}>(declaration: Variants<T>) { return declaration as Readonly<T> }
