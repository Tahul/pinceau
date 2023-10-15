/**
 * Forked from https://github.com/stitchesjs/stitches/blob/canary/packages/stringify
 * Authors:
 * - [Pedro Duarte](https://twitter.com/peduarte)
 * - [Jonathan Neal](https://twitter.com/jon_neal)
 * - [Abdulhadi Alhallak](https://twitter.com/hadi_hlk)
 */

const toAlphabeticChar = (code: number) => String.fromCharCode(code + (code > 25 ? 39 : 97))

function toAlphabeticName(code: number) {
  let name = ''
  let x

  for (x = Math.abs(code); x > 52; x = (x / 52) | 0) name = toAlphabeticChar(x % 52) + name

  return toAlphabeticChar(x % 52) + name
}

function toPhash(h: number, x: string) {
  let i = x.length
  while (i) h = (h * 33) ^ x.charCodeAt(--i)
  return h
}

export function toHash(value: any) {
  return toAlphabeticName(
    toPhash(
      5381,
      JSON.stringify(value),
    ) >>> 0,
  )
}
