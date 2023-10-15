import type { CSSProperties, PseudosProperties } from './properties'
import type { ComputedStyleDefinition } from './computed-styles'
import type { Variants } from './variants'
import type { PinceauUtils } from '$pinceau/utils'
import type { PinceauMediaQueries } from '$pinceau/theme'

export type PropertyType = (string & {}) | (number & {}) | undefined

export type ExtractVariantsProps<V extends Variants> = {
  [K in keyof V]?: ResponsiveProp<Exclude<keyof V[K], 'options'>>
}

export type ResponsiveProp<T> = { [key in PinceauMediaQueries]?: T } | T

export type StyledFunctionArg<
  Props extends {} = {},
  LocalTokens extends string | undefined = undefined,
  TemplateSource extends {} = {},
  SupportVariants extends boolean = true,
> =
  // Support for variants
  (
    SupportVariants extends true ?
        {
          variants?: Variants<LocalTokens, TemplateSource>
        } :
        {
          variants?: undefined
        }
  )
  |
  RawCSS<LocalTokens, TemplateSource, Props, true>

export type CSSFunctionArg<
  LocalTokens extends string | undefined = undefined,
  TemplateSource extends {} = {},
> = RawCSS<LocalTokens, TemplateSource, {}, false>

export type RawCSS<
  LocalTokens extends string | undefined = undefined,
  TemplateSource = {},
  Props = {},
  HasRoot extends boolean = false,
> =
  // Utils properties
  {
    [K in keyof PinceauUtils]?:
    // `utils: { mx: (value: string) => ... }`, grab the type of `value` and inject it.
    | Parameters<PinceauUtils[K]>[0]
    // Same but as Computed Style
    | ComputedStyleDefinition<Props>
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
          [K in keyof CSSProperties]?: CSSProperties<LocalTokens>[K] | ComputedStyleDefinition<Props>
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
        {
          [K in `$${string}`]?: PropertyType | ComputedStyleDefinition<Props>
        }
        |
        {
          [K in `--${string}`]?: PropertyType | ComputedStyleDefinition<Props>
        }
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
