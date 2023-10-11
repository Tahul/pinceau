import type { CSSProperties, PseudosProperties } from './properties'
import type { ComputedStyleDefinition } from './computed-styles'
import type { Variants } from './variants'
import type { GeneratedPinceauMediaQueries as PinceauMediaQueries } from '$pinceau/theme'
import type { GeneratedPinceauUtils as PinceauUtils } from '$pinceau/utils'

export type PropertyType = (string & {}) | (number & {}) | undefined

export type ResponsiveProp<T extends string | number | symbol | undefined> = { [key in PinceauMediaQueries]?: T } | T

export type StyledFunctionArg<
  Source extends Record<string, any> = {},
  Props extends Record<string, any> = {},
  LocalTokens extends string | undefined = undefined,
  TemplateSource extends {} = {},
  SupportVariants extends boolean = true,
> =
  // Support for variants
  (
    SupportVariants extends true ?
    {
      variants?: Variants<
        Source,
        LocalTokens,
        TemplateSource
      >
    } :
    {
      variants?: undefined
    }
  )
  &
  RawCSS<LocalTokens, TemplateSource, Props, true>

export type CSSFunctionArg<
  LocalTokens extends string | undefined = undefined,
  TemplateSource extends {} = {},
> = RawCSS<LocalTokens, TemplateSource, {}, false>

export type RawCSS<
  LocalTokens extends string | undefined = undefined,
  TemplateSource = {},
  Props extends Record<string, any> = {},
  HasRoot extends boolean = false,
> =
  // Utils properties
  {
    [K in keyof PinceauUtils]?:
    // `utils: { mx: (value: string) => ... }`, grab the type of `value` and inject it.
    | Parameters<PinceauUtils[K]>[0]
    // Same but as Computed Style
    | ComputedStyleDefinition
  }
  |
  // Autocomplete from template source
  {
    [K in keyof TemplateSource]?: RawCSS<LocalTokens, TemplateSource[K], Props, true>
  }
  |
  // $media queries
  {
    [K in PinceauMediaQueries]?: RawCSS<LocalTokens, TemplateSource, Props, HasRoot>
  }
  |
  // If the CSS has a root, display all possible properties.
  (
    HasRoot extends true ?
    // CSS Properties
    {
      [K in keyof CSSProperties]?: CSSProperties<LocalTokens>[K] | ComputedStyleDefinition
    }
    |
    // Pseudos properties
    {
      [K in keyof PseudosProperties]?: RawCSS<LocalTokens, TemplateSource, Props, true>
    }
    |
    // Local tokens overwriting
    (
      LocalTokens extends string ?
      {
        [K in LocalTokens]?: PropertyType | ComputedStyleDefinition<Props>
      }
      :
      {}
    )
    |
    // Support for custom properties
    (
      {
        [K in `$${string}`]?: PropertyType | ComputedStyleDefinition<Props>
      }
      &
      {
        [K in `--${string}`]?: PropertyType | ComputedStyleDefinition<Props>
      }
    )
    :
    {}
  )
  |
  // Make this recursive, set root to true past first level
  {
    [key: string]: RawCSS<LocalTokens, TemplateSource, Props, true>
  }

// interface TestTemplate { div: { button: {}; span: {}; '.test': {} }; '.class-test': { button: {}; span: { a: {} } } }

// function css(declaration: CSSFunctionArg<'$test.token', TestTemplate>) { return declaration as Readonly<typeof declaration> }

// function styled<T extends {}>(declaration: StyledFunctionArg<T, '$test.token', TestTemplate>) { return declaration as Readonly<typeof declaration> }
