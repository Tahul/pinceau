import type * as CSSType from 'csstype'
import type * as Utils from './utils'
import type { DefaultThemeMap, PinceauTheme, PinceauThemePaths } from './theme'

export interface ComputedPropertiesUtils {
  isToken: (value: any) => boolean
}

export type VuePseudos =
| '&:deep('
| '&:slotted('
| '&:global('

export type AdvancedPseudos =
  | '&::cue('
  | '&::cue-region('
  | '&::part('
  | '&::slotted('
  | '&:dir('
  | '&:has('
  | '&:host('
  | '&:host-context('
  | '&:is('
  | '&:lang('
  | '&:not('
  | '&:nth-child('
  | '&:nth-last-child('
  | '&:nth-last-of-type('
  | '&:nth-of-type('
  | '&:where('

export type SimplePseudos =
  | '&::after'
  | '&::backdrop'
  | '&::before'
  | '&::cue'
  | '&::cue-region'
  | '&::first-letter'
  | '&::first-line'
  | '&::grammar-error'
  | '&::marker'
  | '&::placeholder'
  | '&::selection'
  | '&::spelling-error'
  | '&::target-text'
  | '&:active'
  | '&:after'
  | '&:any-link'
  | '&:before'
  | '&:blank'
  | '&:checked'
  | '&:current'
  | '&:default'
  | '&:defined'
  | '&:disabled'
  | '&:empty'
  | '&:enabled'
  | '&:first'
  | '&:first-child'
  | '&:first-letter'
  | '&:first-line'
  | '&:first-of-type'
  | '&:focus'
  | '&:focus-visible'
  | '&:focus-within'
  | '&:fullscreen'
  | '&:future'
  | '&:hover'
  | '&:in-range'
  | '&:indeterminate'
  | '&:invalid'
  | '&:last-child'
  | '&:last-of-type'
  | '&:left'
  | '&:link'
  | '&:local-link'
  | '&:nth-col'
  | '&:nth-last-col'
  | '&:only-child'
  | '&:only-of-type'
  | '&:optional'
  | '&:out-of-range'
  | '&:past'
  | '&:paused'
  | '&:picture-in-picture'
  | '&:placeholder-shown'
  | '&:read-only'
  | '&:read-write'
  | '&:required'
  | '&:right'
  | '&:root'
  | '&:scope'
  | '&:target'
  | '&:target-within'
  | '&:user-invalid'
  | '&:user-valid'
  | '&:valid'
  | '&:visited'

export type Pseudos = AdvancedPseudos | SimplePseudos

export interface NativeProperties extends
  CSSType.StandardProperties,
  CSSType.StandardShorthandProperties,
  CSSType.StandardProperties,
  CSSType.SvgProperties {}

/**
 * Pseudos to be used in `css({ ':pseudo': { ...} })`
 */
export type PseudosProperties = {
  [key in Pseudos]?: NativeProperties
}

export type CssProperties = NativeProperties & PseudosProperties

const schemes = {
  '@dark': true,
  '@light': true,
} as const

export interface VariantOptions<K> {
  type?: string
  required?: boolean
  default?: K | ({ [key in MediaQueriesKeys]: K }) | ({ [key: string]: K })
}

export interface BooleanVariant<K> { true?: K; false?: K; options?: VariantOptions<boolean> }

export type EnumVariant<K, T = { [key: string]: K }> = T & { options?: VariantOptions<keyof T> }

export interface Variants<K> {
  [key: string]: BooleanVariant<K> | EnumVariant<K>
}

export type ThemeKey<K extends keyof DefaultThemeMap> = Utils.WrapUnion<Utils.FilterStartingWith<PinceauThemePaths, DefaultThemeMap[K]>, '{', '}'>

export type MediaQueriesKeys = keyof PinceauTheme['media']

export type TokenOrThemeKey<T extends keyof NativeProperties> = (T extends keyof DefaultThemeMap ? (ThemeKey<T> | keyof PinceauTheme[DefaultThemeMap[T]]) : '') | NativeProperties[T]

export type CSS<
  Theme extends object = PinceauTheme,
  TemplateTags extends object = {},
  TemplateProps extends object = {},
  Root extends boolean = true,
> =
  {
    [key in keyof Utils.PrefixObjectKeys<
      // @ts-expect-error - Might not be defined by the user
      Theme['media'],
      '@mq.'
    >]?: (
      | CSS<Theme, TemplateTags, TemplateProps, false>
    )
  }
  &
  {
    [key in keyof typeof schemes]?: (
      | CSS<Theme, TemplateTags, TemplateProps, false>
      | {}
      | undefined
    )
  }
  &
  // Reserved `variants` key keys
  (
    Root extends true ?
        {
          variants?: Variants<CSS<Theme, TemplateTags, TemplateProps, false>>
        } :
        {}
  )
  &
  // Template tags (coming from Volar)
  {
    [K in keyof TemplateTags]?: (
      | CSS<Theme, TemplateTags, TemplateProps, false>
      | {}
      | undefined
    )
  }
  &
  {
    [K in keyof DefaultThemeMap]?: (
      | ThemeKey<K>
      | CssProperties[K]
      | ((props: TemplateProps, utils: ComputedPropertiesUtils) => ThemeKey<K> | CssProperties[K])
      | CSS<Theme, TemplateTags, TemplateProps, false>
      | {}
      | undefined
    )
  }
  &
  // CSS Properties
  {
    [K in Exclude<keyof CssProperties, keyof DefaultThemeMap>]?: (
      | CssProperties[K]
      | ((props: TemplateProps, utils: ComputedPropertiesUtils) => CssProperties[K])
      | {}
      | undefined
    )
  }
  &
  // Other properties (nested selector)
  {
    [K: string]: (
      | CSS<Theme, TemplateTags, TemplateProps, false>
      | ((props: TemplateProps, utils: ComputedPropertiesUtils) => string)
      | { [key: string]: CSS<Theme, TemplateTags, TemplateProps, false> }
      | {}
      | number
      | string
      | undefined
    )
  }

export function css(
  declaration: CSS<
    PinceauTheme,
    {},
    {}
  >,
) { return declaration }

export type CssFunctionType = typeof css
