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
