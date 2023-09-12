import { join, resolve } from 'node:path'
import { build } from 'vite'
import { describe, expect, it } from 'vitest'
import fs from 'fs-extra'
import { getGlobContent } from '../utils'

describe.concurrent(
  'vite',
  () => {
  
    it('examples/vite-lib', async () => {
      const root = resolve(__dirname, '../../examples/vite-lib/')

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
