import type * as Utils from './utils'
import type { PinceauMediaQueries, PinceauUtils } from './theme'
import type { DefaultThemeMap } from './map'
import type { Variants } from './variants'
import type { NativeProperties, PropertyValue, PseudosProperties, UsableTokens } from './properties'

export type ColorSchemeModes = 'media' | 'class'

export type ComputedStyleProp<T = UsableTokens> = T | { [key in PinceauMediaQueries]?: T }

export type ComputedStyleDefinition<T = UsableTokens, ComponentProps = {}> = (props: ComponentProps) => PropertyValue<T> | { [key in PinceauMediaQueries]?: PropertyValue<T> }

export type MappedProperty<K = string, ComponentProps = {}> = K | PropertyValue<K> | ComputedStyleDefinition<K, ComponentProps>

export type CSSProperties<
  ComponentProps = {},
  UtilsProperties = PinceauUtils,
> =
    // Theme-based tokens
    {
      [K in keyof DefaultThemeMap]?: MappedProperty<K, ComponentProps> | {}
    }
    &
    // Native properties tokens
    {
      [K in keyof NativeProperties]?: MappedProperty<K, ComponentProps> | {}
    }
    &
    {
      [K in keyof PseudosProperties]?: CSSProperties<ComponentProps> | {}
    }
    &
    // Custom properties
    {
      [K in keyof UtilsProperties]?: UsableTokens | ComputedStyleDefinition<UsableTokens, ComponentProps> | {}
    }
    &
    {
      [K in string]?: CSSProperties<ComponentProps> | MappedProperty<K, ComponentProps> | {}
    }

export type CSSFunctionType<
  ComponentProps = {},
  UtilsProperties = PinceauUtils,
  MediaQueries extends string = Utils.WrapUnion<PinceauMediaQueries, '@', ''>,
> =
  {
    variants?: Variants<ComponentProps>
  }
  &
  {
    [K in keyof UtilsProperties]?: MappedProperty<K, ComponentProps> | ComputedStyleDefinition<UsableTokens, ComponentProps>
  }
  &
  {
    [K in MediaQueries]?: CSSProperties<ComponentProps> | {}
  }
  &
  {
    [K in string]: CSSProperties<ComponentProps> | MappedProperty<K, ComponentProps> | {}
  }
