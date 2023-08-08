import * as path from 'pathe'
import type { PinceauQuery } from '../types'

// Supported extensions for transforms ($dt or complete Vue SFCs)
export const PINCEAU_STYLES_EXTENSIONS = ['css', 'sass', 'scss', 'postcss', 'less', 'styl', 'stylus']
export const PINCEAU_SCRIPTS_EXTENSIONS = ['jsx', 'mjs', 'tsx', 'js', 'ts', 'cjs']
export const PINCEAU_SUPPORTED_EXTENSIONS = [...PINCEAU_STYLES_EXTENSIONS, ...PINCEAU_SCRIPTS_EXTENSIONS, 'vue']

/**
 * Vue SFC Query, forked from the below:
 * - original repository url: https://github.com/vitejs/vite/tree/main/packages/plugin-vue
 * - code url: https://github.com/vitejs/vite/blob/main/packages/plugin-vue/src/utils/query.ts
 * - author: Evan You (https://github.com/yyx990803)
 * - license: MIT
 *
 * - Copied from: https://github.com/intlify/bundle-tools/blob/37ae3acde9e65bf55f5e820b1653b5fddb7ff0cc/packages/unplugin-vue-i18n/src/query.ts#L1
 */
export function parsePinceauQuery(id: string): PinceauQuery {
  // Extracted data
  const [filename, rawQuery] = id.split('?', 2)
  const params = new URLSearchParams(rawQuery)
  const ret = { filename, id } as PinceauQuery

  // Extraneous parameters
  ret.global = params.has('global')
  ret.src = params.has('src')
  ret.raw = params.has('raw')
  ret.ext = path.extname(filename).slice(1)

  // Target Vue query parameters
  ret.vueQuery = params.has('vue')
  if (params.has('type')) { ret.type = params.get('type') as PinceauQuery['type'] }
  if (params.has('lang.ts')) { ret.lang = 'ts' }
  if (params.has('index')) { ret.index = Number(params.get('index')) }
  if (params.has('scoped')) { ret.scoped = String(params.get('scoped')) }
  if (params.has('setup')) { ret.setup = params.get('setup') === 'true' }
  if (params.has('transformed')) { ret.transformed = params.get('transformed') === 'true' }

  // Target language
  if (params.has('lang')) { ret.lang = params.get('lang') as PinceauQuery['lang'] }

  // Is target file a SFC?
  if (ret.ext === 'vue' && !ret.type && !ret.index) { ret.sfc = 'vue' }

  // Is target style?
  if (PINCEAU_STYLES_EXTENSIONS.includes(ret.ext)) { ret.styles = true }
  if (ret.lang && PINCEAU_STYLES_EXTENSIONS.includes(ret.lang)) { ret.styles = true }

  // Is target tranformable?
  if (PINCEAU_SUPPORTED_EXTENSIONS.includes(ret.ext)) { ret.transformable = true }

  return ret
}
