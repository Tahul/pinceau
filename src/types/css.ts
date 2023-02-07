import type { utils } from '../runtime/utils'
import type * as Utils from './utils'
import type { PinceauMediaQueries, PinceauUtils } from './theme'
import type { DefaultThemeMap } from './map'
import type { Variants } from './variants'
import type { NativeProperties, PropertyValue, PseudosProperties, UsableTokens } from './properties'

export type ComputedStylesUtils = typeof utils

export type ColorSchemeModes = 'media' | 'class'

export type ComputedStyleProp<T = UsableTokens> = T | { [key in PinceauMediaQueries]?: T }

export type ComputedStyleDefinition<T = UsableTokens, ComponentProps = {}> = (props: ComponentProps, utils: ComputedStylesUtils) => PropertyValue<T> | { [key in PinceauMediaQueries]?: PropertyValue<T> }

export type MappedProperty<K = string, ComponentProps = {}> = PropertyValue<K> | ComputedStyleDefinition<K, ComponentProps>

export type CSSProperties<
  ComponentProps = {},
> =
    // Theme-based tokens
    {
      [K in keyof DefaultThemeMap]?: MappedProperty<K, ComponentProps>
    }
    &
    // Native properties tokens
    {
      [K in keyof NativeProperties]?: MappedProperty<K, ComponentProps>
    }
    &
    {
      [K in keyof PseudosProperties]?: CSSProperties<ComponentProps> | {}
    }
    &
    // Custom properties
    {
      [K in keyof PinceauUtils]?: string | UsableTokens | ComputedStyleDefinition<UsableTokens, ComponentProps>
    }
    &
    {
      [K in Utils.Primitive]?: CSSProperties<ComponentProps> | MappedProperty<K, ComponentProps> | {}
    }

export type CSSFunctionType<ComponentProps = {}> =
  {
    variants?: Variants<ComponentProps>
  }
  &
  {
    [K in keyof PinceauUtils]?: UsableTokens
  }
  &
  {
    [K in Utils.WrapUnion<PinceauMediaQueries, '@', ''>]?: CSSProperties<ComponentProps>
  }
  &
  {
    [K in string]: CSSProperties<ComponentProps> | MappedProperty<K, ComponentProps> | {}
  }
