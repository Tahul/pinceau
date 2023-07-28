export const referencesRegex = new RegExp(
  '\\'
  + '{'
  + '([^'
  + '}'
  + ']+)'
  + '\\'
  + '}',
  'g',
)

export const darkToken = '@dark'

export const lightToken = '@light'

export const initialToken = '@initial'

export const mqPlainRegex = /@([^\s]+)/g

export const mqCssRegex = /@([^\s]+)\s{/g

export const darkRegex = /(@dark\s{)/g

export const lightRegex = /(@light\s{)/g
