import type { ExtractVariantsProps, StyledFunctionArg, SupportedHTMLElements, Variants } from '@pinceau/style'

export interface PinceauReactOptions { }

export interface StyledComponentFactory<Type extends SupportedHTMLElements> {
  <Props extends {} = {}>(declaration: StyledFunctionArg<Props>): (
    React.FunctionComponent<React.ComponentProps<Type> & React.PropsWithChildren<Props>>
    &
    {
      withVariants: <VariantsContent extends Variants>(variants: VariantsContent) => React.FunctionComponent<
        React.PropsWithChildren<Props>
        & ExtractVariantsProps<VariantsContent>
      >
    }
  )
}
