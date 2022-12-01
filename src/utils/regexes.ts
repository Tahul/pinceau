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

export const rgbaRegex = /rgb[a?]?\(([^\)]+)(,[^\)]+?)\)/mg

export const calcRegex = /calc\((.*?)\)/mg

export const mqPlainRegex = /@([^\s]+)/g

export const mqCssRegex = /@([^\s]+)\s{/g

export const darkRegex = /(@dark\s{)/g

export const lightRegex = /(@light\s{)/g

export const DARK = '@dark'

export const LIGHT = '@light'

export const INITIAL = '@initial'

export const dtRegex = /\$dt\('(.*?)'\)/g

export const variantsRegex = /(...)?variants(,)?/mg
