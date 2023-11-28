import { version as defaultVersion } from 'vue'
import * as defaultCompiler from 'vue/compiler-sfc'
import type {
  SFCAsyncStyleCompileOptions,
  SFCScriptCompileOptions,
  SFCTemplateCompileOptions,
} from 'vue/compiler-sfc'
import { createVuePlugin, pluginTypes } from '@pinceau/vue/utils'
import { compileFile } from '../transforms'
import { compileModulesForPreview, processModule } from '../compiler'
import { pinceauVersion } from '.'
import type { File, ReplStore, ReplTransformer } from '.'

const defaultMainFile = 'src/App.vue'

const welcomeCode = `
<script lang="ts" setup>
import { ref } from 'vue'

const msg = ref('Hello World!')
</script>

<template>
  <h1>{{ msg }}</h1>
  <input v-model="msg">
</template>
`.trim()

export interface SFCOptions {
  script?: Partial<SFCScriptCompileOptions>
  style?: Partial<SFCAsyncStyleCompileOptions>
  template?: Partial<SFCTemplateCompileOptions>
}

const localImports = {
  'vue': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/@vue/runtime-dom@${version}/dist/runtime-dom.esm-browser.js`,
  'vue/compiler-sfc': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/@vue/compiler-sfc@${version}/dist/compiler-sfc.esm-browser.js`,
  'vue/runtime-dom': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/@vue/runtime-dom@${version}/dist/runtime-dom.esm-browser.js`,
  'vue/server-renderer': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/@vue/server-renderer@${version}/dist/server-renderer.esm-browser.js`,
  'defu': () => 'https://cdn.jsdelivr.net/npm/defu@6.1.2/dist/defu.mjs',
  'scule': () => 'https://cdn.jsdelivr.net/npm/scule@1.0.0/dist/index.mjs',
  '@pinceau/runtime': () => `https://cdn.jsdelivr.net/npm/@pinceau/runtime@${pinceauVersion}/dist/index.mjs`,
  '@pinceau/stringify': () => `https://cdn.jsdelivr.net/npm/@pinceau/stringify@${pinceauVersion}/dist/index.mjs`,
  '@pinceau/core/runtime': () => `https://cdn.jsdelivr.net/npm/@pinceau/core@${pinceauVersion}/dist/runtime.mjs`,
  '@pinceau/theme/runtime': () => `https://cdn.jsdelivr.net/npm/@pinceau/theme@${pinceauVersion}/dist/runtime.mjs`,
  '@pinceau/vue/runtime': () => `https://cdn.jsdelivr.net/npm/@pinceau/vue@${pinceauVersion}/dist/runtime.mjs`,
  '@pinceau/outputs/vue-plugin': () => './vue-plugin-proxy.js',
}

export class ReplVueTransformer implements ReplTransformer<typeof defaultCompiler, SFCOptions> {
  name: string = 'vue'
  store: ReplStore
  defaultMainFile: string = defaultMainFile
  welcomeCode: string = welcomeCode
  defaultVersion: string = defaultVersion
  targetVersion?: string
  compiler: typeof defaultCompiler = defaultCompiler
  compilerOptions: SFCOptions = {}
  pendingImport: Promise<any> | null = null
  imports: typeof localImports = localImports
  shims = {}

  tsconfig: any = {
    compilerOptions: {
      allowJs: true,
      checkJs: true,
      jsx: 'Preserve',
      target: 'ESNext',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      allowImportingTsExtensions: true,
      types: ['@pinceau/outputs'],
    },
    vueCompilerOptions: {
      target: 3.3,
    },
  }

  constructor({ store }: { store: ReplStore }) {
    this.store = store

    // Set proper `fs` compiler options
    if (!this.compilerOptions) {
      this.compilerOptions = {}
    }
    if (!this.compilerOptions.script) {
      this.compilerOptions.script = {}
    }
    this.compilerOptions.script.fs = {
      fileExists(file: string) {
        if (file.startsWith('/')) { file = file.slice(1) }
        return !!store.state.files[file]
      },
      readFile(file: string) {
        if (file.startsWith('/')) { file = file.slice(1) }
        return store.state.files[file].code
      },
    }

    this.store.pinceauProvider.pinceauContext.addTypes(pluginTypes)
  }

  async init() {
    //
  }

  getTypescriptDependencies() {
    return {
      'vue': this.targetVersion || this.defaultVersion,
      '@vue/compiler-core': this.targetVersion || this.defaultVersion,
      '@vue/compiler-dom': this.targetVersion || this.defaultVersion,
      '@vue/compiler-sfc': this.targetVersion || this.defaultVersion,
      '@vue/compiler-ssr': this.targetVersion || this.defaultVersion,
      '@vue/reactivity': this.targetVersion || this.defaultVersion,
      '@vue/runtime-core': this.targetVersion || this.defaultVersion,
      '@vue/runtime-dom': this.targetVersion || this.defaultVersion,
      '@vue/shared': this.targetVersion || this.defaultVersion,
      '@pinceau/vue/runtime': 'latest',
      '@pinceau/style': 'latest',
      '@pinceau/theme': 'latest',
      '@pinceau/runtime': 'latest',
      '@pinceau/outputs': '1.0.0-beta.22',
      '@pinceau/outputs/theme': '1.0.0-beta.22',
      '@pinceau/outputs/utils': '1.0.0-beta.22',
    }
  }

  async setVersion(version: string) {
    this.targetVersion = version

    const compilerUrl = this.imports['vue/compiler-sfc'](version)
    const runtimeUrl = this.imports['vue/runtime-dom'](version)
    const ssrUrl = this.imports['vue/server-renderer'](version)

    this.pendingImport = import(/* @vite-ignore */ compilerUrl)
    this.compiler = await this.pendingImport
    this.pendingImport = null

    const importMap = this.store.getImportMap()
    const imports = importMap.imports || (importMap.imports = {})

    imports.vue = runtimeUrl
    imports['vue/server-renderer'] = ssrUrl

    this.store.setImportMap(importMap)
    this.store.forceSandboxReset()
    this.store.reloadLanguageTools?.()

    console.info(`[@pinceau/repl] Now using Vue version: ${version}`)
  }

  resetVersion() {
    this.targetVersion = undefined
    this.compiler = defaultCompiler

    const importMap = this.store.getImportMap()
    const _imports = importMap.imports || (importMap.imports = {})

    _imports.vue = this.imports['vue/runtime-dom'](defaultVersion)
    _imports['vue/server-renderer'] = this.imports['vue/server-renderer'](defaultVersion)

    this.store.setImportMap(importMap)
    this.store.forceSandboxReset()

    console.info('[@pinceau/repl] Has been reset to Vue mode.')
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
        // Include `@pinceau/outputs/theme` and `@pinceau/outputs/utils` and skip the rest
        // theme.css is included in srcdoc.html via replace
        [
          '@pinceau/outputs/theme-ts',
          '@pinceau/outputs/theme.css',
          '@pinceau/outputs/utils-ts',
          '@pinceau/outputs',
        ].includes(key)
      ) { continue }

      modules.push(code.compiled.ssr || code.compiled.js)
    }

    return [
      processModule(
        this.store,
        createVuePlugin(this.store.pinceauProvider.pinceauContext),
        '@pinceau/outputs/vue-plugin',
      ).code,
      ...modules,
    ]
  }

  async compileFile(file: File): Promise<(string | Error)[]> {
    return compileFile(this.store, file)
  }

  async updatePreview() {
    if (this.store.sandboxCreating) { await this.store.sandboxCreating }
    if (!this.store.previewProxy.value) { return }
    if ((import.meta as any).env.PROD && this.store.clearConsole.value) { console.clear() }

    this.store.runtimeError.value = null
    this.store.runtimeWarning.value = null

    let isSSR = this.store.ssr.value || false

    if (this.targetVersion) {
      const [major, minor, patch] = this.targetVersion
        .split('.')
        .map(v => Number.parseInt(v, 10))
      if (major === 3 && (minor < 2 || (minor === 2 && patch < 27))) {
        // eslint-disable-next-line no-alert
        alert(`The selected version of the framework (${this.targetVersion}) does not support in-browser SSR. Rendering in client mode instead.`)
        isSSR = false
      }
    }

    try {
      const mainFile = this.store.state.mainFile!

      // if SSR, generate the SSR bundle and eval it to render the HTML
      if (isSSR && mainFile!.endsWith('.vue')) {
        const ssrModules = compileModulesForPreview(this.store, true)

        console.log({ ssrModules })

        console.log(`[@pinceau/repl] successfully compiled ${ssrModules.length} modules for SSR.`)

        await this.store.previewProxy.value.eval([
          'const __modules__ = {};',
          ...this.getBuiltFilesModules(),
          ...ssrModules,
        `import { renderToString as _renderToString } from 'vue/server-renderer'
         import { createSSRApp as _createApp } from 'vue'
         const { PinceauVue } = __modules__["@pinceau/outputs/vue-plugin"]

         const AppComponent = __modules__["${mainFile}"].default

         console.log(PinceauVue)
         
         AppComponent.name = 'Repl'
         
         const app = _createApp(AppComponent)
         
         app.use(PinceauVue)

         if (!app.config.hasOwnProperty('unwrapInjectedRef')) {
           app.config.unwrapInjectedRef = true
         }
         
         app.config.warnHandler = () => {}
         
         window.__ssr_promise__ = _renderToString(app).then(html => {
           document.getElementById('pinceau-runtime').innerHTML = app.config.globalProperties.$pinceauSSR.toString()
           document.body.innerHTML = '<div id="app">' + html + '</div>' + \`${this.store.previewOptions.value?.bodyHTML || ''}\`
         }).catch(err => {
           console.error("SSR Error", err)
         })
        `,
        ])
      }

      // compile code to simulated module system
      const modules = compileModulesForPreview(this.store)

      console.log(modules)

      console.log(`[@pinceau/repl] Compiled ${modules.length} module${modules.length > 1 ? 's' : ''}.`)

      const codeToEval = [
        'window.__modules__ = {};window.__css__ = [];'
        + `if (window.__app__) window.__app__.unmount();${
       isSSR
        ? ''
        : `document.body.innerHTML = '<div id="app"></div>' + \`${this.store.previewOptions.value?.bodyHTML || ''
          }\``}`,
        ...this.getBuiltFilesModules(),
        ...modules,
      `setTimeout(()=> {
        document.querySelectorAll('style[css]').forEach(el => el.remove())
        document.head.insertAdjacentHTML('beforeend', window.__css__.map(s => \`<style css>\${s}</style>\`).join('\\n'))
      }, 1)`,
      ]

      // if main file is a vue file, mount it.
      if (mainFile.endsWith('.vue')) {
        codeToEval.push(
        `import { ${isSSR ? 'createSSRApp' : 'createApp'} as _createApp } from 'vue'
        const { PinceauVue } = __modules__["@pinceau/outputs/vue-plugin"]
        ${this.store.previewOptions.value?.customCode?.importCode || ''}

        const AppComponent = __modules__["${mainFile}"].default

        const _mount = () => {
          AppComponent.name = 'Repl'
          const app = window.__app__ = _createApp(AppComponent)

          app.use(PinceauVue)

          if (!app.config.hasOwnProperty('unwrapInjectedRef')) {
            app.config.unwrapInjectedRef = true
          }

          app.config.errorHandler = e => console.error(e)

          ${this.store.previewOptions?.value.customCode?.useCode || ''}
          
          app.mount('#app')
        }
        if (window.__ssr_promise__) {
          window.__ssr_promise__.then(_mount)
        } else {
          _mount()
        }`,
        )
      }

      // eval code in sandbox
      await this.store.previewProxy.value.eval(codeToEval)
    }
    catch (e: any) {
      console.error(e)
      this.store.runtimeError.value = (e as Error).message
    }
  }
}
