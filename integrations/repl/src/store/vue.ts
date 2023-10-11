import { version as defaultVersion } from 'vue'
import * as defaultCompiler from 'vue/compiler-sfc'
import type {
  SFCAsyncStyleCompileOptions,
  SFCScriptCompileOptions,
  SFCTemplateCompileOptions,
} from 'vue/compiler-sfc'
import type { Ref } from 'vue'
import { compileFile } from '../transforms'
import { compileModulesForPreview } from '../compiler'
import type { PreviewProxy } from '../components/output/PreviewProxy'
import type { File, ReplStore, ReplTransformer } from '.'

const defaultMainFile = 'src/App.vue'

const welcomeCode = `
<script setup>
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
}

export class ReplVueTransformer implements ReplTransformer {
  name: string = 'vue'
  store: ReplStore
  defaultMainFile: string = defaultMainFile
  welcomeCode: string = welcomeCode
  defaultVersion: string = defaultVersion
  targetVersion?: string
  compiler: typeof defaultCompiler = defaultCompiler
  options: SFCOptions = {}
  pendingCompiler: Promise<any> | null = null
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
    },
    vueCompilerOptions: {
      target: 3.3,
    },
  }

  constructor({ store }: { store: ReplStore }) {
    this.store = store
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
    }
  }

  async setVersion(version: string) {
    this.targetVersion = version

    const compilerUrl = this.imports['vue/compiler-sfc'](version)
    const runtimeUrl = this.imports['vue/runtime-dom'](version)
    const ssrUrl = this.imports['vue/server-renderer'](version)

    this.pendingCompiler = import(/* @vite-ignore */ compilerUrl)
    this.compiler = await this.pendingCompiler
    this.pendingCompiler = null

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
    if (import.meta.env.PROD && clearConsole.value) {
      console.clear()
    }
    runtimeError.value = null
    runtimeWarning.value = null

    let isSSR = ssr || false

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
      const mainFile = this.store.state.mainFile

      // if SSR, generate the SSR bundle and eval it to render the HTML
      if (isSSR && mainFile.endsWith('.vue')) {
        const ssrModules = compileModulesForPreview(this.store, true)

        console.log(
        `[@pinceau/repl] successfully compiled ${ssrModules.length} modules for SSR.`,
        )

        await proxy.eval([
          'const __modules__ = {};',
          ...ssrModules,
        `import { renderToString as _renderToString } from 'vue/server-renderer'
         import { createSSRApp as _createApp } from 'vue'
         const AppComponent = __modules__["${mainFile}"].default
         AppComponent.name = 'Repl'
         const app = _createApp(AppComponent)
         if (!app.config.hasOwnProperty('unwrapInjectedRef')) {
           app.config.unwrapInjectedRef = true
         }
         app.config.warnHandler = () => {}
         window.__ssr_promise__ = _renderToString(app).then(html => {
           document.body.innerHTML = '<div id="app">' + html + '</div>' + \`${previewOptions?.bodyHTML || ''
        }\`
         }).catch(err => {
           console.error("SSR Error", err)
         })
        `,
        ])
      }

      // compile code to simulated module system
      const modules = compileModulesForPreview(this.store)
      console.log(`[@pinceau/repl] Compiled ${modules.length} module${modules.length > 1 ? 's' : ''}.`)

      const codeToEval = [
        'window.__modules__ = {};window.__css__ = [];'
      + `if (window.__app__) window.__app__.unmount();${
       isSSR
        ? ''
        : `document.body.innerHTML = '<div id="app"></div>' + \`${previewOptions?.bodyHTML || ''
        }\``}`,
        ...modules,
      `setTimeout(()=> {
        document.querySelectorAll('style[css]').forEach(el => el.remove())
        document.head.insertAdjacentHTML('beforeend', window.__css__.map(s => \`<style css>\${s}</style>\`).join('\\n'))
      }, 1)`,
      ]

      // if main file is a vue file, mount it.
      if (mainFile.endsWith('.vue')) {
        codeToEval.push(
        `import { ${isSSR ? 'createSSRApp' : 'createApp'
        } as _createApp } from "vue"
        ${previewOptions?.customCode?.importCode || ''}
        const _mount = () => {
          const AppComponent = __modules__["${mainFile}"].default
          AppComponent.name = 'Repl'
          const app = window.__app__ = _createApp(AppComponent)
          if (!app.config.hasOwnProperty('unwrapInjectedRef')) {
            app.config.unwrapInjectedRef = true
          }
          app.config.errorHandler = e => console.error(e)
          ${previewOptions?.customCode?.useCode || ''}
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
      await proxy.eval(codeToEval)
    }
    catch (e: any) {
      console.error(e)
      runtimeError.value = (e as Error).message
    }
  }
}
