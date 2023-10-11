import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { set } from '../packages/core/dist/utils.mjs'
import { walkTokens } from '../packages/theme/dist/runtime.mjs'

const srcPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  './export.json',
)

const outPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  './tokens.json',
)

const exported = JSON.parse(
  readFileSync(srcPath),
)['Pinceau Colors']

delete exported.name

console.log(exported)

const map = {
  color: {},
}

walkTokens(
  exported,
  (token) => {
    const tokenPath = token.name.split('/').map(p => p.toLowerCase())
    set(map, `color.${tokenPath.join('.')}`, token.value)
  },
)

writeFileSync(
  outPath,
  `${JSON.stringify(map, null, 2)}\n`,
)
