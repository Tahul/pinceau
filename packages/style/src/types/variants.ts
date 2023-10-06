import type { PinceauMediaQueries } from '@pinceau/theme'
import type { CSSProperties, RawCSS } from '@pinceau/style'

export interface VariantOptions<T = {}> {
  type?: string
  required?: boolean
  default?: Exclude<keyof T, 'options'> | { [key in PinceauMediaQueries]?: Exclude<keyof T, 'options'> }
  mediaPrefix?: boolean
}

export type Variant<
  T extends Record<string, CSSProperties> = {},
  LocalTokens extends string = (string & {}),
  TemplateSource extends {} = {}
> =
  {
    options?: VariantOptions<T>
  }
  &
  {
    [K in keyof T]?: K extends 'options' ? VariantOptions<T> : RawCSS<LocalTokens, TemplateSource, {}, true> & { $class?: string }
  }

export type Variants<
  Source extends Record<string, {}> = {},
  LocalTokens extends string = (string & {}),
  TemplateSource extends {} = {}
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
/* eslint-disable-next-line unused-imports/no-unused-vars */
// function variant<T extends {}>(declaration: Variant<T>) { return declaration as Readonly<T> }
/* eslint-disable-next-line unused-imports/no-unused-vars */
// function variants<T extends {}>(declaration: Variants<T>) { return declaration as Readonly<T> }

