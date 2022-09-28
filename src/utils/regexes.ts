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

export const mediaQueryRegex = /(@mq\s(.*?)\s{)/g

export const darkRegex = /(@dark\s{)/g

export const lightRegex = /(@light\s{)/g
