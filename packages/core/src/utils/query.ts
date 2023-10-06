import * as path from 'pathe'
import type { PinceauQuery, PinceauQueryBlockType } from '../types'

// Supported extensions for transforms ($dt or complete Vue SFCs)
export const PINCEAU_STYLES_EXTENSIONS = ['css', 'sass', 'scss', 'postcss', 'less', 'styl', 'stylus']
export const PINCEAU_SCRIPTS_EXTENSIONS = ['jsx', 'tsx', 'js', 'ts', 'mjs', 'cjs']
export const PINCEAU_TEMPLATE_EXTENSIONS = ['html']
export const PINCEAU_SFC_EXTENSIONS = ['vue', 'svelte', 'astro']
export const PINCEAU_SUPPORTED_EXTENSIONS = [...PINCEAU_STYLES_EXTENSIONS, ...PINCEAU_SCRIPTS_EXTENSIONS, ...PINCEAU_TEMPLATE_EXTENSIONS, ...PINCEAU_SFC_EXTENSIONS]

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
  const ret: PinceauQuery = {
    id,
    filename,
    ext: path.extname(filename).slice(1),

    src: params.has('src') ? String(params.get('src')) : undefined,
    raw: params.has('raw') || undefined,
    global: params.has('global') || undefined,

    vueQuery: params.has('vue') || undefined,
    type: params.get('type') as PinceauQueryBlockType || undefined,
    index: params.has('index') ? Number(params.get('index')) : undefined,
    scoped: params.has('scoped') ? String(params.get('scoped')) : undefined,
    lang: params.get('lang') as PinceauQuery['lang'] || (params.has('lang.ts') ? 'ts' : undefined),
    setup: params.get('setup') === 'true' || undefined,
    transformed: params.get('pctransformed') === 'true' || undefined,

    styleFunction: params.has('pc-fn') ? String(params.get('pc-fn')) : undefined,

    sfc: undefined,
    transformable: undefined,
  }

  // Is target file a SFC?
  if (ret.ext === 'vue' && !ret.type && !ret.index) { ret.sfc = 'vue' }
  if (ret.ext === 'svelte' && !ret.type) { ret.sfc = 'svelte' }
  if (ret.ext === 'astro') { ret.sfc = 'astro' }

  // Resolve type from ext
  if (PINCEAU_STYLES_EXTENSIONS.includes(ret.ext)) { ret.type = 'style' }
  if (PINCEAU_SCRIPTS_EXTENSIONS.includes(ret.ext)) { ret.type = 'script' }
  if (PINCEAU_TEMPLATE_EXTENSIONS.includes(ret.ext)) { ret.type = 'template' }

  // Resolve type from lang arg
  if (ret.lang && PINCEAU_STYLES_EXTENSIONS.includes(ret.lang)) { ret.type = 'style' }
  if (ret.lang && PINCEAU_SCRIPTS_EXTENSIONS.includes(ret.lang)) { ret.type = 'script' }
  if (ret.lang && PINCEAU_TEMPLATE_EXTENSIONS.includes(ret.lang)) { ret.type = 'template' }

  if (PINCEAU_SUPPORTED_EXTENSIONS.includes(ret.ext)) { ret.transformable = true }

  return ret
}
