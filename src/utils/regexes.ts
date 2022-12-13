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

export const cssContentRegex = /css\(({.*?\})\)/mgs

export const mqPlainRegex = /@([^\s]+)/g

export const mqCssRegex = /@([^\s]+)\s{/g

export const darkRegex = /(@dark\s{)/g

export const lightRegex = /(@light\s{)/g

export const DARK = '@dark'

export const LIGHT = '@light'

export const INITIAL = '@initial'

export const dtRegex = /\$dt\('(.*?)'\)/g

export const variantsRegex = /(...)?variants(,)?/mg

export const outputFileNames = [
  'virtual:pinceau:/__pinceau_css.css',
  'virtual:pinceau:/__pinceau_ts.ts',
  'virtual:pinceau:/__pinceau_js.js',
  'virtual:pinceau:/__pinceau_flat_ts.ts',
  'virtual:pinceau:/__pinceau_flat_js.js',
]
