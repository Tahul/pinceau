export const referencesRegex = new RegExp(
  '\\'
  + '{'
  + '([^'
  + '}'
  + ']+)'
  + '\\'
  + '}', 'g',
)

export const cssContentRegex = /css\(({.*?\})\)/mgs

export const rgbaRegex = /rgb(a?)?\((.*?)\)/mg
