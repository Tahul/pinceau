import { readFileSync } from 'node:fs'
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
