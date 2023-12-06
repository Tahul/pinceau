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

const define = {
  '__filename': undefined,
  'process.env': {},
  'process.version': {},
  '__VUE_PROD_DEVTOOLS__': JSON.stringify(true),
  'process.versions.node': '\'20.0.0\'',
}

export default defineConfig({
  define,
  resolve: {
    alias: {
      'path': 'path-browserify',
      '@vue/compiler-dom': '@vue/compiler-dom/dist/compiler-dom.cjs.js',
      '@vue/compiler-core': '@vue/compiler-core/dist/compiler-core.cjs.js',
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
      'sfc-composer',
      'sfc-composer/vue',
      'sfc-composer/svelte',
      'sfc-composer/astro',
      'recast/parsers/typescript.js',
      'ultrahtml',
      'defu',
      'node:process',
      'micromatch',
      'vscode-languageserver-textdocument',
      'vscode-uri',
      'nanoid',
      'scule',
      'style-dictionary',
      'pathe',
      'node:fs',
      '@volar/language-core',
      'svelte2tsx',
      '@jridgewell/sourcemap-codec',
      'recast',
      '@babel/parser',
      'volar-service-typescript',
      'untyped',
    ],
  },
  server: {
    proxy: {
      // Using the proxy instance
      '/pinceau-functions': {
        target: 'https://pinceau-functions.yael.dev',
        changeOrigin: true,
        configure: (proxy, options) => {
          if (!options.headers) { options.headers = {} }
          options.headers.Origin = 'https://play.pinceau.dev'
        },
      },
    },
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
      external: ['vue', 'vue/compiler-sfc', 'react', 'svelte', 'fs', 'fs.realpath'],
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
