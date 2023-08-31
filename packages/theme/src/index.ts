import type { ThemeFunction } from './types'

export * from './types'

export { version } from '../package.json'

declare global {
  export const $theme: ThemeFunction
}
