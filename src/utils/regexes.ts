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

export const rgbaRegex = /rgb(a?)?\((.*?)\)/mg

export const mqPlainRegex = /@mq\.(.*)/

export const mqCssRegex = /(@mq.(.*?)\s{)/g

export const darkRegex = /(@dark\s{)/g

export const lightRegex = /(@light\s{)/g

export const DARK = '@dark'

export const LIGHT = '@light'

export const dtRegex = /\$dt\('(.*?)'\)/g

export const variantsClassRegex = /\$variantsClass/g
