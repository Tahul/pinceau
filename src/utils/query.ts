import * as path from 'pathe'

/**
 * Vue SFC Query, forked from the below:
 * - original repository url: https://github.com/vitejs/vite/tree/main/packages/plugin-vue
 * - code url: https://github.com/vitejs/vite/blob/main/packages/plugin-vue/src/utils/query.ts
 * - author: Evan You (https://github.com/yyx990803)
 * - license: MIT
 *
 * - Copied from: https://github.com/intlify/bundle-tools/blob/37ae3acde9e65bf55f5e820b1653b5fddb7ff0cc/packages/unplugin-vue-i18n/src/query.ts#L1
 */

export interface VueQuery {
  id: string
  filename: string
  vue?: boolean
  src?: boolean
  global?: boolean
  type?: 'script' | 'template' | 'style' | 'custom'
  blockType?: string
  index?: number
  locale?: string
  lang?: string
  raw?: boolean
  scoped?: string
  transformed?: boolean
  issuerPath?: string
  css: boolean
}

export function parseVueQuery(id: string) {
  const [filename, rawQuery] = id.split('?', 2)
  const params = new URLSearchParams(rawQuery)
  const ret = {
    filename,
    id,
  } as VueQuery

  const langPart = Object.keys(Object.fromEntries(params)).find(key => /lang\./i.test(key))
  ret.vue = params.has('vue') || id.endsWith('.vue')
  ret.global = params.has('global')
  ret.src = params.has('src')
  ret.raw = params.has('raw')
  if (params.has('type')) {
    ret.type = params.get('type') as VueQuery['type']
  }
  if (params.has('blockType')) {
    ret.blockType = params.get('blockType') as VueQuery['blockType']
  }
  if (params.has('index')) {
    ret.index = Number(params.get('index'))
  }
  if (params.has('scoped')) {
    ret.scoped = String(params.get('scoped'))
  }
  if (langPart) {
    const [, lang] = langPart.split('.')
    ret.lang = lang
  }
  else if (params.has('lang')) {
    ret.lang = params.get('lang') as VueQuery['lang']
  }
  if (params.has('issuerPath')) {
    ret.issuerPath = params.get('issuerPath') as VueQuery['issuerPath']
  }
  const ext = path.extname(id)
  if (['.css', '.postcss', '.styl', '.stylus', '.sass', '.scss', '.less'].includes(ext)) {
    ret.css = true
  }

  return ret
}
