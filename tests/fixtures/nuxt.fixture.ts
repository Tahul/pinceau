import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'
import { getGlobContent } from '../utils'

describe('nuxt', async () => {
  const rootDir = resolve(__dirname, '../../examples/nuxt')

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
