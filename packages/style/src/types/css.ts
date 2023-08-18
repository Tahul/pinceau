import type { DefaultThemeMap, PinceauMediaQueries, PinceauUtils } from '@pinceau/theme'
import type { WrapUnion } from '@pinceau/style'
import type { NativeProperties, PseudosProperties } from './properties'
import type { PropertyValue, UsableTokens } from './resolvers'

export type ComputedStyleProp<T> = T | { [key in PinceauMediaQueries]?: T }

export type ComputedStyleDefinition<T extends string | number> = () => PropertyValue<T> | T | { [key in PinceauMediaQueries]?: T | PropertyValue<T> }

export type MappedProperty<K extends string | number> = K | PropertyValue<K> | ComputedStyleDefinition<K>

type MQs = WrapUnion<PinceauMediaQueries, '@', ''>

export type RawCSS =
  {
    [K in keyof PseudosProperties]?: CSSProperties
  }
  &
  {
    [K in keyof PinceauUtils]?: UsableTokens | ComputedStyleDefinition<K>
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
    [K in MQs]?: { [key: string]: CSSProperties }
  }

export type CSSProperties<Source = {}> =
  RawCSS
  &
  {
    [K in keyof Source]?: K extends MQs ? { [MQ in keyof Source[K]]: CSSProperties<Source[K][MQ]> } :
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
export type CSS<Source = {}> = {
  [K in keyof Source | MQs | keyof PinceauUtils]?:
  (
    K extends MQs ? (K extends keyof Source ? { [MQ in keyof Source[K]]: CSSProperties<Source[K][MQ]> } : never) :
      K extends keyof PinceauUtils ? (Parameters<PinceauUtils[K]>[0] extends undefined ? string | number | boolean : Parameters<PinceauUtils[K]>[0] | ComputedStyleDefinition<Parameters<PinceauUtils[K]>[0]>) :
        K extends keyof Source ? CSSProperties<Source[K]> | Source[K] : never
  )
}

/** Local testing purposes; this ain't exposed nor used anywhere */
function css<T>(declaration: CSS<T>) { return declaration as Readonly<T> }
