export const referencesRegex = new RegExp(
  '\\'
  + '{'
  + '([^'
  + '}'
  + ']+)'
  + '\\'
  + '}', 'g',
)

export const keyRegex = /{(.*)}/g

export const mqPlainRegex = /@([^\s]+)/g

export const mqCssRegex = /@([^\s]+)\s{/g

export const darkRegex = /(@dark\s{)/g

export const lightRegex = /(@light\s{)/g

export const DARK = '@dark'

export const LIGHT = '@light'

export const INITIAL = '@initial'

export const dtRegex = /\$dt\(['|`|"]([a-zA-Z0-9.]+)['|`|"](?:,\s*(['|`|"]([a-zA-Z0-9.]+)['|`|"]))?\)?/g

export const variantsRegex = /(...)?variants(,)?/mg

export const responsiveMediaQueryRegex = /^(:|\.)/

export const outputFileNames = [
  '/__pinceau_css.css',
  '/__pinceau_ts.ts',
  '/__pinceau_utils.ts',
]
