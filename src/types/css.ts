import type { utils } from '../runtime/utils'
import type * as Utils from './utils'
import type { PinceauMediaQueries, PinceauUtils } from './theme'
import type { DefaultThemeMap } from './map'
import type { Variants } from './variants'
import type { NativeProperties, PropertyValue, PseudosProperties, UsableTokens } from './properties'

export type ComputedStylesUtils = typeof utils

export type ColorSchemeModes = 'media' | 'class'

export type ComputedStyleProp<T = UsableTokens> = T | (string & {}) | { [key in PinceauMediaQueries]: T | (string & {}) }

export type ComputedStyleDefinition<
  SupportedProperties = '',
  TemplateProps = {},
  > = (props: TemplateProps, utils: ComputedStylesUtils) => PropertyValue<SupportedProperties> | ({ [key in PinceauMediaQueries]?: PropertyValue<SupportedProperties> })

type MappedProperty<
  K = string,
  TemplateProps = {},
> = PropertyValue<K> | ComputedStyleDefinition<K, TemplateProps>

export type CSSProperties<
  TemplateProps = {},
> =
    // Theme-based tokens
    {
      [K in keyof DefaultThemeMap]?: MappedProperty<K, TemplateProps>
    }
    &
    // Native properties tokens
    {
      [K in keyof NativeProperties]?: MappedProperty<K, TemplateProps>
    }
    &
    {
      [K in keyof PseudosProperties]?: CSSProperties<TemplateProps> | {}
    }
    &
    // Custom properties
    {
      [K in keyof PinceauUtils]?: UsableTokens | ComputedStyleDefinition<UsableTokens, TemplateProps>
    }
    &
    {
      [K in string | number | symbol]: CSSProperties<TemplateProps> | UsableTokens | MappedProperty<K, TemplateProps> | ComputedStyleDefinition<UsableTokens, TemplateProps> | {}
    }

export type CSSFunctionType<TemplateProps = {}> =
  {
    variants?: Variants
  }
  &
  {
    [K in keyof PinceauUtils]?: UsableTokens
  }
  &
  {
    [K in Utils.WrapUnion<PinceauMediaQueries, '@', ''>]?: CSSProperties<TemplateProps>
  }
  &
  {
    [K in string | number | symbol]: CSSProperties<TemplateProps> | MappedProperty<K, TemplateProps> | {}
  }
