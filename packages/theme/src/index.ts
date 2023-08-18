import { TokensFunction } from './types'

export * from './types'

export { version } from '../package.json'

declare global {
  const $theme: TokensFunction
}
