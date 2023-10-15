import type * as React from 'react'
import type { ExtractVariantsProps, StyledFunctionArg, SupportedHTMLElements, Variants } from '@pinceau/style'

export interface PinceauReactOptions { }

export type PinceauStyledComponent<
  Type extends SupportedHTMLElements,
  Props extends {} = {},
  Attrs extends {} = {},
> = React.FunctionComponent<React.ComponentProps<Type> & React.PropsWithChildren<Props> & Attrs>

export interface StyledComponentFactory<
  Type extends SupportedHTMLElements,
  OuterProps extends {} = {},
  OuterAttrs extends {} = {},
> {
  <Props extends {} = {}>(declaration: StyledFunctionArg<Props>): (
    PinceauStyledComponent<Type, Props & OuterProps, OuterAttrs>
    &
    (
      {
        withVariants: <VariantsContent extends Variants>(variants: VariantsContent) => WithVariants<
          VariantsContent,
          Type,
          OuterProps & Props,
          OuterAttrs
        >
        withAttrs: <AttrsContent extends { [key: string]: string }>(attrs: AttrsContent) => WithAttrs<
          AttrsContent,
          Type,
          OuterProps & Props,
          OuterAttrs
        >
      }
    )
  )
}

export type WithAttrs<
  AttrsContent extends { [key: string]: string },
  Type extends SupportedHTMLElements,
  OuterProps extends {} = {},
  OuterAttrs extends {} = {},
  > = PinceauStyledComponent<Type, OuterProps, AttrsContent & OuterAttrs> &
  {
    withVariants: <VariantsContent extends Variants>(variants: VariantsContent) => WithVariants<
      VariantsContent,
      Type,
      OuterProps,
      OuterAttrs & AttrsContent
    >
  }

export type WithVariants<
  VariantsContent extends Variants,
  Type extends SupportedHTMLElements,
  OuterProps extends {} = {},
  OuterAttrs extends {} = {},
> = (
  PinceauStyledComponent<Type, OuterProps & ExtractVariantsProps<VariantsContent>, OuterAttrs>
  &
  {
    withAttrs: <AttrsContent extends { [key: string]: string }>(attrs: AttrsContent) => WithAttrs<
      AttrsContent,
      Type,
      OuterProps & ExtractVariantsProps<VariantsContent>,
      OuterAttrs
    >
  }
)
