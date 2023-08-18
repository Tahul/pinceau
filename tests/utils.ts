import { readFileSync } from 'node:fs'
import { createResolver } from '@nuxt/kit'
import type { namedTypes } from 'ast-types'
import type { NodePath } from 'ast-types/lib/node-path'
import fg from 'fast-glob'
import { visitAst } from '@pinceau/core/utils'
import { expect } from 'vitest'

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
  path: resolveFixtures('./'),
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
