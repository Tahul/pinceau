import { ThemeTokens } from "../../../../packages/style/src"

export const fontSize: number = 16

export const test = 'hello world'

export const backgroundColor: string = 'white'

export default styled<{
  fontSize: ThemeTokens<'$fontSize'>,
  backgroundColor: ThemeTokens<'$color'>
}>({
  fontSize: props => props.fontSize,
  backgroundColor: props => props.backgroundColor,
})
