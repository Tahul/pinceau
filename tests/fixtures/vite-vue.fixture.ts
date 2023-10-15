import { join, resolve } from 'node:path'
import { build } from 'vite'
import { describe, expect, it } from 'vitest'
import fs from 'fs-extra'
import { getGlobContent } from '../utils'

describe.concurrent(
  'vite',
  () => {
    it('examples/vite-vue', async () => {
      const root = resolve(__dirname, '../../examples/vite-vue/')

      await fs.emptyDir(join(root, 'dist'))

      await build({
        root,
        logLevel: 'warn',
        build: {
          sourcemap: true,
        },
      })

      const css = await getGlobContent(root, 'dist/**/*.css')

      expect(css).toContain('--color-green-9')
    }, { timeout: 10000 })
  },
)
