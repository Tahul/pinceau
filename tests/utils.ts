import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createResolver } from '@nuxt/kit'
import type { namedTypes } from 'ast-types'
import type { NodePath } from 'ast-types/lib/node-path'
import fg from 'fast-glob'
import { visitAst } from '@pinceau/core/utils'
import { expect } from 'vitest'
import { mount as testUtilsMount } from '@vue/test-utils'
import type { PinceauRuntimeSheet, PinceauThemeSheet } from '@pinceau/runtime'
import { useRuntimeSheet as _useRuntimeSheet, useThemeSheet as _useThemeSheet } from '@pinceau/runtime'

/**
 * Build time helpers
 */

export const resolveFixtures = (p?: string) => createResolver(import.meta.url).resolve('./fixtures/', p || '')

export const resolveTmp = (p?: string) => createResolver(import.meta.url).resolve('./tmp', p || '')

export async function getGlobContent(cwd: string, glob: string) {
  return await fg(glob, { cwd, absolute: true })
    .then(r => Promise.all(r.map(f => readFileSync(f, 'utf-8'))))
    .then(r => r.join('\n'))
}

export const testLayer = {
  tokens: {
    color: {
      primary: 'red',
    },
  },
}

export const testFileLayer = {
  path: resolveFixtures('./theme'),
  configFileName: 'theme.config',
}

export const paletteLayer = {
  path: resolveFixtures('../../packages/palette'),
  configFileName: 'theme.config',
}

export function findNode(
  ast: any,
  cb: (path: NodePath<namedTypes.ObjectProperty>) => boolean,
) {
  let match: NodePath<namedTypes.ObjectProperty> | undefined
  visitAst(
    ast,
    {
      visitObjectProperty(path) {
        if (cb(path)) {
          match = path
          return false
        }
        return this.traverse(path)
      },
    },
  )
  if (!match) { throw new Error('Node not found!') }
  return match
}

export function expectLog(content: any) {
  expect('log').toBe(content)
}

export const alias = {
  // @pinceau/core
  '@pinceau/core/utils': resolve(__dirname, '../packages/core/src/utils.ts'),
  '@pinceau/core/plugin': resolve(__dirname, '../packages/core/src/plugin.ts'),
  '@pinceau/core/runtime': resolve(__dirname, '../packages/core/src/runtime.ts'),
  '@pinceau/core': resolve(__dirname, '../packages/core/src/index.ts'),

  // @pinceau/theme
  '@pinceau/theme/plugin': resolve(__dirname, '../packages/theme/src/plugin.ts'),
  '@pinceau/theme/transforms': resolve(__dirname, '../packages/theme/src/transforms.ts'),
  '@pinceau/theme/utils': resolve(__dirname, '../packages/theme/src/utils.ts'),
  '@pinceau/theme/runtime': resolve(__dirname, '../packages/theme/src/runtime.ts'),
  '@pinceau/theme': resolve(__dirname, '../packages/theme/src/index.ts'),

  // @pinceau/runtime
  '@pinceau/runtime/plugin': resolve(__dirname, '../packages/runtime/src/plugin.ts'),
  '@pinceau/runtime': resolve(__dirname, '../packages/runtime/src/index.ts'),

  // @pinceau/style
  '@pinceau/style/utils': resolve(__dirname, '../packages/style/src/utils.ts'),
  '@pinceau/style/plugin': resolve(__dirname, '../packages/style/src/plugin.ts'),
  '@pinceau/style/transforms': resolve(__dirname, '../packages/style/src/transforms.ts'),
  '@pinceau/style': resolve(__dirname, '../packages/style/src/index.ts'),

  // @pinceau/vue
  '@pinceau/vue/plugin': resolve(__dirname, '../packages/vue/src/plugin.ts'),
  '@pinceau/vue/transforms': resolve(__dirname, '../packages/vue/src/transforms.ts'),
  '@pinceau/vue/runtime': resolve(__dirname, '../packages/vue/src/runtime.ts'),
  '@pinceau/vue/utils': resolve(__dirname, '../packages/vue/src/utils.ts'),
  '@pinceau/vue': resolve(__dirname, '../packages/vue/src/index.ts'),

  // @pinceau/language-server
  '@pinceau/language-server': resolve(__dirname, '../packages/language-server/src/index.ts'),

  // @pinceau/vscode
  '@pinceau/vscode': resolve(__dirname, '../packages/vscode/src/index.ts'),

  // pinceau (main plugin)
  'pinceau/plugin': resolve(__dirname, '../packages/pinceau/src/plugin.ts'),
  'pinceau': resolve(__dirname, '../packages/pinceau/src/index.ts'),
}

/**
 * Runtime helpers
 */

export const PinceauVueOptions = { dev: false, colorSchemeMode: 'media', computedStyles: true, variants: true, ssr: { theme: true, runtime: true }, appId: false }

export const PinceauPlugin = {
  install(app, options = {}) {
    injectSheet('pinceau-theme', '')

    injectSheet('pinceau-runtime', '')

    const _options = { ...PinceauVueOptions, ...options } as any

    const themeSheet = _useThemeSheet(_options)
    app.provide('pinceauThemeSheet', themeSheet)

    const runtimeSheet = _useRuntimeSheet({ themeSheet, ..._options })
    app.provide('pinceauRuntimeSheet', runtimeSheet)

    app.config.globalProperties.$pinceauSSR = { toString: () => runtimeSheet.toString() }
  },
}

export function injectSheet(id: string, content?: string) {
  // Remove existing sheet if exists
  const existingSheet = document.getElementById(id)!
  if (existingSheet) { removeSheet(id) }

  // Create sheet
  const themeSheet = document.createElement('style')
  themeSheet.id = id
  themeSheet.textContent = content || ''
  document.head.append(themeSheet)
}

export function removeSheet(id: string) {
  const styleSheets = document.querySelectorAll(`#${id}`)
  if (styleSheets.length) { styleSheets.forEach(styleSheet => styleSheet.remove()) }
}

export const mount: typeof testUtilsMount = (component, options, ...rest) => {
  if (!options) { options = {} }
  if (!options.global) { options.global = {} }
  if (!options.global.plugins) { options.global.plugins = [PinceauPlugin] }

  return testUtilsMount(component, options, ...rest)
}

export function getSheetFromComponent<T extends 'runtime' | 'theme'>(component: any, type: T): T extends 'runtime' ? PinceauRuntimeSheet : PinceauThemeSheet {
  return component.__app._context.provides[type === 'runtime' ? 'pinceauRuntimeSheet' : 'pinceauThemeSheet']
}

export function getRulesFromSheet(sheet: PinceauRuntimeSheet) {
  return Array.from(sheet.cache.entries()).reduce(
    (acc, [key, rule]) => {
      acc[key] = rule
      return acc
    },
    {},
  )
}
