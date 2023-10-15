import { createResolver } from '@nuxt/kit'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import Pinceau from '@pinceau/vue/plugin'
import vue from '@vitejs/plugin-vue'
import replace from '@rollup/plugin-replace'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import Icons from 'unplugin-icons/vite'

const resolve = (p: string) => createResolver(import.meta.url).resolve(p)

const genStub: Plugin = {
  name: 'gen-stub',
  apply: 'build',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'ssr-stub.js',
      source: 'module.exports = {}',
    })
  },
}

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
    genStub,
    nodePolyfills(),
    Icons({ compiler: 'vue3' }),
    Pinceau({
      style: {
        excludes: [
          resolve('../../packages'),
          'node_modules/**/*',
        ],
      },
      theme: {
        buildDir: resolve('./node_modules/.pinceau'),
        layers: [
          {
            path: resolve('../../packages/palette/'),
          },
        ],
      },
    }) as any,
    vue({
      script: {
        defineModel: true,
      },
    }),
  ],
  optimizeDeps: {
    // avoid late discovered deps
    include: [
      'path-browserify',
      'onigasm',
      'typescript',
      '@volar/cdn',
      '@vue/language-service',
      'monaco-editor-core/esm/vs/editor/editor.worker',
      '@volar/monaco/worker',
      'vue/server-renderer',
      'vue',
      'svelte',
      'react',
    ],
  },
  base: './',
  build: {
    target: 'esnext',
    minify: false,
    commonjsOptions: {
      ignore: ['typescript'],
    },
    lib: {
      entry: {
        'vue-repl': './src/index.ts',
        'monaco-editor': './src/components/editor/MonacoEditor.vue',
      },
      formats: ['es'],
      fileName: () => '[name].js',
    },
    rollupOptions: {
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
      external: ['vue', 'vue/compiler-sfc', 'react', 'svelte'],
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
