import type { Ref } from 'vue'
import * as defaultCompiler from 'svelte/compiler'
import { createSveltePlugin, pluginTypes } from '@pinceau/svelte/utils'
import { compileFile } from '../transforms'
import { compileModulesForPreview, processModule } from '../compiler'
import type { PreviewProxy } from '../components/output/PreviewProxy'
import type { ReplStore, ReplTransformer } from '.'
import { File, pinceauVersion } from '.'

const defaultMainFile = 'src/App.svelte'

const welcomeCode = `
<script lang="ts">
	let name = 'world';
</script>

<h1>Hello {name}!</h1>
`.trim()

const defaultVersion = '4.2.1'

const localImports = {
  'svelte': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/svelte@${version}/src/runtime/index.js`,
  'estree': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/estree-walker@${version}/src/index.js`,
  'estree-walker': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/estree-walker@${version}/src/index.js`,
  '@types/estree': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/@types/estree@${version}/index.d.ts`,
  'svelte/internal': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/svelte@${version}/src/runtime/internal/index.js`,
  'svelte/compiler': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/svelte@${version}/src/compiler/index.js`,
  'svelte/animate': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/svelte@${version}/src/runtime/animate/index.js`,
  'svelte/easing': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/svelte@${version}/src/runtime/easing/index.js`,
  'svelte/motion': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/svelte@${version}/src/runtime/motion/index.js`,
  'svelte/store': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/svelte@${version}/src/runtime/store/index.js`,
  'svelte/internal/disclose-version': (version = defaultVersion) => `'https://cdn.jsdelivr.net/npm/svelte@${version}/src/runtime/internal/disclose-version/index.js`,
  'svelte/transition': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/svelte@${version}/src/runtime/transition/index.js`,
  'defu': () => 'https://cdn.jsdelivr.net/npm/defu@6.1.2/dist/defu.mjs',
  'scule': () => 'https://cdn.jsdelivr.net/npm/scule@1.0.0/dist/index.mjs',
  '@pinceau/runtime': () => `https://cdn.jsdelivr.net/npm/@pinceau/runtime@${pinceauVersion}/dist/index.mjs`,
  '@pinceau/stringify': () => `https://cdn.jsdelivr.net/npm/@pinceau/stringify@${pinceauVersion}/dist/index.mjs`,
  '@pinceau/core/runtime': () => `https://cdn.jsdelivr.net/npm/@pinceau/core@${pinceauVersion}/dist/runtime.mjs`,
  '@pinceau/theme/runtime': () => `https://cdn.jsdelivr.net/npm/@pinceau/theme@${pinceauVersion}/dist/runtime.mjs`,
  '@pinceau/svelte/runtime': () => `https://cdn.jsdelivr.net/npm/@pinceau/svelte@${pinceauVersion}/dist/runtime.mjs`,
  '@pinceau/outputs/svelte-plugin': () => './svelte-plugin-proxy.js',
}

export class ReplSvelteTransformer implements ReplTransformer {
  name: string = 'svelte'
  store: ReplStore
  defaultMainFile: string = defaultMainFile
  welcomeCode: string = welcomeCode
  defaultVersion: string = defaultVersion
  defaultCompiler: typeof defaultCompiler = defaultCompiler
  targetVersion?: string
  compiler: typeof defaultCompiler = defaultCompiler
  compilerOptions: {} = {}
  pendingImport: Promise<any> | null = null
  imports: typeof localImports = localImports
  shims = {
    'global.d.ts': new File('global.d.ts', `
    declare module 'svelte';
    import 'svelte/elements';
    `),
  }

  tsconfig: any = {
    compilerOptions: {
      target: 'ESNext',
      useDefineForClassFields: true,
      lib: ['DOM', 'DOM.Iterable', 'ESNext'],
      allowJs: false,
      skipLibCheck: false,
      esModuleInterop: false,
      allowSyntheticDefaultImports: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      module: 'ESNext',
      moduleResolution: 'Node',
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      types: ['@pinceau/outputs'],
    },
  }

  constructor({ store }: { store: ReplStore }) {
    this.store = store

    this.store.pinceauProvider.pinceauContext.addTypes(pluginTypes)
  }

  getTypescriptDependencies() {
    return {
      svelte: this.targetVersion || this.defaultVersion,
    }
  }

  async setVersion(version: string) {
    this.targetVersion = version

    const importMap = this.store.getImportMap()

    const newImports = Object.entries({ ...importMap, ...this.imports }).reduce<{ [key in keyof typeof localImports]?: string }>((acc, [key, version]) => {
      acc[key] = version
      if (typeof version === 'function') {
        acc[key] = version(this.targetVersion)
      }
      return acc
    }, {})

    this.pendingImport = newImports?.['svelte/compiler'] ? import(/* @vite-ignore */ newImports?.['svelte/compiler']) : new Promise(() => defaultCompiler)
    this.compiler = await this.pendingImport
    this.pendingImport = null

    importMap.imports = newImports

    this.store.setImportMap(importMap)
    this.store.forceSandboxReset()
    this.store.reloadLanguageTools?.()

    console.info(`[@pinceau/repl] Now using Svelte version: ${version}`)
  }

  resetVersion() {
    this.targetVersion = undefined
    this.compiler = defaultCompiler

    const importMap = this.store.getImportMap()

    const newImports = Object.entries({ ...(importMap?.imports || {}), ...this.imports }).reduce<{ [key in keyof typeof localImports]?: string }>((acc, [key, version]) => {
      acc[key] = version
      if (typeof version === 'function') {
        acc[key] = version(this.defaultVersion)
      }
      return acc
    }, {})

    this.store.setImportMap({ imports: newImports })
    this.store.forceSandboxReset()

    console.info('[@pinceau/repl] Has been reset to Svelte mode.')
  }

  getDefaultImports(version: string = defaultVersion) {
    return Object.fromEntries(
      Object.entries(this.imports).map(([key, value]) => {
        if (typeof value === 'string') {
          return [key, value]
        }
        return [key, value(version)]
      }),
    )
  }

  getBuiltFilesModules() {
    const modules: string[] = []

    for (const [key, code] of Object.entries(this.store.state.builtFiles)) {
      if (
        [
          '@pinceau/outputs/theme',
          '@pinceau/outputs/theme-ts',
          '@pinceau/outputs/theme.css',
          '@pinceau/outputs/utils-ts',
          '@pinceau/outputs',
        ].includes(key)
      ) { continue }
      modules.push(code.code)
    }

    const sveltePlugin = createSveltePlugin(this.store.pinceauProvider.pinceauContext)

    return [
      processModule(
        this.store,
        sveltePlugin,
        '@pinceau/outputs/svelte-plugin',
      ).code,
      ...modules,
    ]
  }

  async compileFile(file: File): Promise<(string | Error)[]> {
    return compileFile(this.store, file)
  }

  async updatePreview(
    clearConsole: Ref<boolean>,
    runtimeError: Ref<string | null>,
    runtimeWarning: Ref<string | null>,
    ssr: boolean,
    proxy: PreviewProxy,
    previewOptions: any,
  ) {
    if ((import.meta as any).env.PROD && clearConsole.value) {
      console.clear()
    }
    runtimeError.value = null
    runtimeWarning.value = null

    const isSSR = ssr || true

    try {
      const mainFile = this.store.state.mainFile

      // if SSR, generate the SSR bundle and eval it to render the HTML
      if (isSSR && (mainFile.endsWith('.svelte'))) {
        const ssrModules = compileModulesForPreview(this.store, true)

        console.log(`[@pinceau/repl] Successfully compiled ${ssrModules.length} modules for SSR.`)

        await proxy.eval([
          'const __modules__ = {};',
          ...this.getBuiltFilesModules(),
          ...ssrModules,
        ])
      }

      // compile code to simulated module system
      const modules = compileModulesForPreview(this.store)

      console.log(`[@pinceau/repl] Compiled ${modules.length} module${modules.length > 1 ? 's' : ''}.`)

      const codeToEval = [
        'window.__modules__ = {};window.__css__ = [];'
      + `if (window.__app__) window.__app__.unmount();${
       isSSR && false
        ? ''
        : `document.body.innerHTML = '<div id="app"></div>' + \`${previewOptions?.bodyHTML || ''
          }\``}`,
        ...this.getBuiltFilesModules(),
        ...modules,
      `setTimeout(()=> {
        document.querySelectorAll('style[css]').forEach(el => el.remove())
        document.head.insertAdjacentHTML('beforeend', window.__css__.map(s => \`<style css>\${s}</style>\`).join('\\n'))
      }, 1)`,
      ]

      // if main file is a vue file, mount it.
      if (mainFile.endsWith('.svelte')) {
        codeToEval.push(
          `
        ${previewOptions?.customCode?.importCode || ''}

        import { pinceauPlugin } from '@pinceau/outputs/svelte-plugin'
        
        const mount = () => {
          pinceauPlugin()
          
          const AppComponent = __modules__["${mainFile}"].default

          const rootEl = document.getElementById('app')

          const rootComp = new AppComponent({ target: rootEl })
          
          ${previewOptions?.customCode?.useCode || ''}
        }

        mount()`,
        )
      }

      // eval code in sandbox
      await proxy.eval(codeToEval)
    }
    catch (e: any) {
      console.error(e)
      runtimeError.value = (e as Error).message
    }
  }
}
