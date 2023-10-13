import type { CSSProperties, RawCSS } from '@pinceau/style'
import type { PinceauMediaQueries } from '$pinceau/theme'

export interface VariantOptions<PropType = {}> {
  type?: string
  required?: boolean
  default?: PropType | { [key in PinceauMediaQueries]?: PropType }
  mediaPrefix?: boolean
}

export type Variant<
  PropValue,
  LocalTokens extends string | undefined = undefined,
  TemplateSource extends {} = {},
  > =
(
  {
    options?: VariantOptions<PropValue>
  }
)
&
{
  [K in string]?: K extends 'options' ? VariantOptions<PropValue> : RawCSS<LocalTokens, TemplateSource, {}, true> & { $class?: string }
}

export type Variants<
  LocalTokens extends string | undefined = undefined,
  TemplateSource extends {} = {},
  Props = {},
> = {
  [K in string]: K extends keyof Props ? Variant<Props[K], LocalTokens, TemplateSource> : Variant<string | undefined, LocalTokens, TemplateSource>
}

export interface VariantsProps {
  [key: string]: string | boolean | { [key: string]: string | boolean }
}

/** Local testing purposes; this ain't exposed nor used anywhere */

// function variant<T extends {}>(declaration: Variant<T>) { return declaration as Readonly<T> }

// function variants<T extends {}>(declaration: Variants<T>) { return declaration as Readonly<T> }
