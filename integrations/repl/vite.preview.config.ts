import { createResolver } from '@nuxt/kit'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import replace from '@rollup/plugin-replace'
import Pinceau from '@pinceau/vue/plugin'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const resolve = (p: string) => createResolver(import.meta.url).resolve(p)

export default defineConfig({
  resolve: {
    alias: {
      'path': 'path-browserify',
      '@vue/compiler-dom': '@vue/compiler-dom/dist/compiler-dom.cjs.js',
      '@vue/compiler-core': '@vue/compiler-core/dist/compiler-core.cjs.js',
      '@pinceau/stringify': resolve('../../packages/stringify/src/index.ts'),
      '@pinceau/runtime': resolve('../../packages/runtime/src/index.ts'),
      '@pinceau/core/runtime': resolve('../../packages/core/src/runtime.ts'),
      '@pinceau/theme/runtime': resolve('../../packages/theme/src/runtime.ts'),
      '@pinceau/vue/runtime': resolve('../../integrations/vue/src/runtime.ts'),
    },
  },
  plugins: [
    nodePolyfills(),
    Pinceau({
      style: {
        excludes: [
          resolve('../../packages'),
          'node_modules/**/*',
        ],
      },
      theme: {
        layers: [
          {
            path: resolve('../../packages/palette/'),
          },
        ],
      },
    }) as any,
    vue(),
  ],
  optimizeDeps: {
    // avoid late discovered deps
    include: [
      'path-browserify',
      'onigasm',
      'typescript',
      '@volar/cdn',
      '@vue/language-service',
      'monaco-editor/esm/vs/editor/editor.worker',
      '@volar/monaco/worker',
      'vue/server-renderer',
    ],
  },
  base: './',
  build: {
    target: 'esnext',
    minify: false,
    commonjsOptions: {
      ignore: ['typescript'],
    },
    worker: {
      format: 'es',
      plugins: [
        replace({
          preventAssignment: true,
          values: {
            'process.env.NODE_ENV': JSON.stringify('production'),
          },
        }),
      ],
    },
  } as any,
},
)
