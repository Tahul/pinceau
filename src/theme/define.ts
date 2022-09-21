import type { ConfigTokens, PinceauTheme, PinceauTokens } from '../types'

export const defineTheme = (config: ConfigTokens & PinceauTokens): PinceauTheme => config as PinceauTheme
