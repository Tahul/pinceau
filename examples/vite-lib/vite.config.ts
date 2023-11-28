import { createResolver } from '@nuxt/kit'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pinceau from 'pinceau/plugin'

const resolve = (p: string) => createResolver(import.meta.url).resolve(p)

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve('lib/main.ts'),
      name: 'MyLib',
      fileName: 'my-lib',
      formats: [
        'cjs',
        'es',
        'iife',
        'umd',
      ],
    },
    cssCodeSplit: true,
  },
  plugins: [
    Vue(),
    Pinceau({
      debug: 2,
      theme: {
        layers: [
          {
            path: resolve('../../packages/pigments/'),
          },
        ],
      },
      style: {
        excludes: [
          resolve('../../packages'),
        ],
      },
    }),
  ],
})
