import type * as CSSType from './csstype'

export type PseudosProperties = { [key in CSSType.Pseudos]?: CSSProperties }

export type CSSProperties<
  LocalTokens extends string = (string & {}),
> =
  CSSType.StandardProperties<LocalTokens> &
  CSSType.StandardShorthandProperties<LocalTokens> &
  CSSType.StandardProperties<LocalTokens> &
  CSSType.SvgProperties<LocalTokens>

export type PropertyValue<K extends string | number | undefined> = K extends keyof CSSProperties ? CSSProperties[K] : never
