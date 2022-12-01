import type * as CSSType from 'csstype'
import type { DefaultThemeMap } from './map'
import type { PinceauTokensPaths } from './theme'
import type * as Utils from './utils'

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

export type PseudosProperties = { [key in Pseudos]?: NativeProperties }

export interface NativeProperties extends
  CSSType.StandardProperties,
  CSSType.StandardShorthandProperties,
  CSSType.StandardProperties,
  CSSType.SvgProperties {}

export type ThemeKey<K extends keyof DefaultThemeMap> = Utils.WrapUnion<Utils.FilterStartingWith<PinceauTokensPaths, DefaultThemeMap[K]>, '{', '}'>

export type SupportedProperties = keyof NativeProperties | keyof DefaultThemeMap

export type PropertyValue<T = string> =
(
  T extends keyof NativeProperties ?
    T extends keyof DefaultThemeMap ?
      ThemeKey<T> | NativeProperties[T] :
      NativeProperties[T] :
    never
)

export type UsableTokens = Utils.WrapUnion<PinceauTokensPaths, '{', '}'>
