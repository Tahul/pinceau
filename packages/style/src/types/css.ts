import type { DefaultThemeMap, PinceauMediaQueries, PinceauUtils } from '@pinceau/theme'
import type { DataType as CSSDataType } from 'csstype'
import type { NativeProperties, PseudosProperties } from './properties'
import type { PropertyValue } from './resolvers'
import type { ComputedStyleDefinition } from './computed-styles'
import type { Variants } from './variants'

export type MappedProperty<K extends string | number> = Exclude<
  // Source
  PropertyValue<K> | ComputedStyleDefinition<K | number> | (string & {}) | (number & {}),
  // Filtered value types
  CSSDataType.DeprecatedSystemColor
>

export type ResponsiveProp<T> = T | { [key in PinceauMediaQueries]?: T }

export type RawCSS =
  (
    {
      [K in keyof PseudosProperties]?: CSSProperties
    }
    &
    {
      [K in keyof PinceauUtils]?: Parameters<PinceauUtils[K]>[0] | ComputedStyleDefinition<Parameters<PinceauUtils[K]>[0]>
    }
    &
    {
      [K in keyof NativeProperties]?: MappedProperty<K>
    }
    &
    {
      [K in keyof DefaultThemeMap]?: MappedProperty<K>
    }
    &
    {
      [K in PinceauMediaQueries]?: { [key: string]: CSSProperties }
    }
  )
  |
  {
    [key: string]: RawCSS
  }

export type CSSProperties<Source = {}> =
  RawCSS
  &
  {
    [K in keyof Source]?: K extends PinceauMediaQueries ? { [MQ in keyof Source[K]]: CSSProperties<Source[K][MQ]> } :
      K extends keyof PseudosProperties ? CSSProperties<Source[K]> :
        K extends keyof PinceauUtils ? Parameters<PinceauUtils[K]>[0] | ComputedStyleDefinition<Parameters<PinceauUtils[K]>[0]> :
          K extends keyof NativeProperties ? MappedProperty<K> :
            K extends keyof DefaultThemeMap ? MappedProperty<K> :
              K extends string ? CSSProperties<Source[K]> :
                CSSProperties<Source[K]>
  }

/**
 * This type proxifies the Source object and tries to provide context to both keys and values from generated built outputs.
 */
export type CSS<
  Source = {},
  TemplateSource = {},
> =
  (
    // Autocomplete from template source object
    {
      [K in keyof TemplateSource]?: TemplateSource[K]
    }
    |
    // Autocomplete from theme and native properties
    {
      [K in keyof Source | PinceauMediaQueries | keyof PinceauUtils]?:
      (
        K extends PinceauMediaQueries ? (K extends keyof Source ? { [MQ in keyof Source[K]]: CSSProperties<Source[K][MQ]> } : never) :
          K extends keyof PinceauUtils ? (Parameters<PinceauUtils[K]>[0] extends undefined ? string | number | boolean : Parameters<PinceauUtils[K]>[0] | ComputedStyleDefinition<Parameters<PinceauUtils[K]>[0]>) :
            K extends 'variants' ? Variants<Source[K]> :
              K extends keyof Source ? CSSProperties<Source[K]> | Source[K] : never
      )
    }
  )
  &
  {
    variants?: Variants
  }

/** Local testing purposes; this ain't exposed nor used anywhere */
interface TestTemplate { div: { button: {}; span: {}; '.test': {} }; '.class-test': { button: {}; span: { a: {} } } }
/* eslint-disable-next-line unused-imports/no-unused-vars */
function css<T extends {}>(declaration: CSS<T, TestTemplate>) { return declaration as Readonly<T> }
/* eslint-disable-next-line unused-imports/no-unused-vars */
function styled<T extends {}>(declaration: CSSProperties<T>) { return declaration as Readonly<T> }
