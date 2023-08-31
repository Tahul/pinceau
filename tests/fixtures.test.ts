import { join, resolve } from 'node:path'
import { build } from 'vite'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'
import fs from 'fs-extra'
import { getGlobContent } from './utils'

describe.concurrent(
  'vite',
  () => {
    it('examples/vite-vue', async () => {
      const root = resolve(__dirname, '../examples/vite-vue/')

      await fs.emptyDir(join(root, 'dist'))

      await build({
        root,
        logLevel: 'warn',
        build: {
          sourcemap: true,
        },
      })

      const css = await getGlobContent(root, 'dist/**/*.css')

      expect(css).toContain('--color-green-1')
    }, { timeout: 10000 })

    it('examples/vite-lib', async () => {
      const root = resolve(__dirname, '../examples/vite-lib/')

      await fs.emptyDir(join(root, 'dist'))

      await build({
        root,
        logLevel: 'warn',
        build: {
          sourcemap: true,
        },
      })

      const js = await getGlobContent(root, 'dist/**/*.js')
      const css = await getGlobContent(root, 'dist/*.css')

      expect(css).toBeDefined()
      expect(js).toBeDefined()
      expect(css).contains('--color-blue-1')
      expect(js).contains('--color-white')
    }, { timeout: 10000 })
  },
)

describe('nuxt', async () => {
  const rootDir = resolve(__dirname, '../examples/nuxt')

  await setup({
    rootDir,
    runner: 'vitest',
    server: true,
    build: true,
  })

  it('examples/nuxt', async () => {
    const test = await $fetch('/')
    const css = await getGlobContent(rootDir, '.nuxt/**/dist/client/**/*.css')

    expect(test).toBeDefined()
    expect(css).contains('--color-blue-1')
    expect(css).contains('--color-white')
  }, { timeout: 10000 })
})
