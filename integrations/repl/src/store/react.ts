import type { Ref } from 'vue'
import { compileFile } from '../transforms'
import { compileModulesForPreview } from '../compiler'
import type { PreviewProxy } from '../components/output/PreviewProxy'
import type { ReplStore, ReplTransformer } from '.'
import { File } from '.'

const defaultMainFile = 'src/App.tsx'

const welcomeCode = `
export default () => {
  return <div>Hello World</div>
}
`.trim()

const defaultVersion = '18.2.0'

const localImports = {
  'react': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/react@${version}/umd/react.development.js`,
  'react-dom': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/react-dom@${version}/umd/react-dom.development.js`,
  'react-dom/client': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/react-dom@${version}/client.js`,
  'react-dom/server': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/react-dom@${version}/umd/react-dom-server.browser.development.js`,
  '@types/react': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/@types/react@${version}/index.d.ts`,
  '@types/react-dom': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/@types/react-dom@${version}/index.d.ts`,
}

export class ReplReactTransformer implements ReplTransformer {
  name: string = 'react'
  store: ReplStore
  defaultMainFile: string = defaultMainFile
  welcomeCode: string = welcomeCode
  defaultVersion: string = defaultVersion
  targetVersion?: string
  compiler = null
  options: {} = {}
  pendingCompiler: Promise<any> | null = null
  imports: typeof localImports = localImports
  shims = {
    'globals.d.ts': new File('globals.d.ts', `import * as React from 'react'
import * as ReactDOM from 'react-dom'

export {}

declare global {
    const React: typeof React
    const ReactDOM: typeof ReactDOM
}`),
    'runtime.d.ts': new File('runtime.d.ts', 'declare module \'react/jsx-runtime\';'),
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
      jsx: 'react-jsx',
      paths: {
        react: ['./node_modules/@types/react'],
      },
      types: ['@types/react', '@types/react-dom'],
    },
  }

  constructor({ store }: { store: ReplStore }) {
    this.store = store
  }

  getTypescriptDependencies() {
    return {
      '@types/react': this.targetVersion || this.defaultVersion || '18.2.0',
      '@types/react-dom': this.targetVersion || this.defaultVersion || '18.2.0',
    }
  }

  async setVersion(version: string) {
    this.targetVersion = version

    const runtimeUrl = this.imports.react(version)
    const runtimDomUrl = this.imports['react-dom'](version)
    const ssrUrl = this.imports['react-dom/server'](version)

    const importMap = this.store.getImportMap()
    const imports = importMap.imports || (importMap.imports = {})

    imports.react = runtimeUrl
    imports['react-dom'] = runtimDomUrl
    imports['react-dom/server'] = ssrUrl

    this.store.setImportMap(importMap)
    this.store.forceSandboxReset()
    this.store.reloadLanguageTools?.()

    console.info(`[@pinceau/repl] Now using React version: ${version}`)
  }

  resetVersion() {
    this.targetVersion = undefined

    const importMap = this.store.getImportMap()
    const _imports = importMap.imports || (importMap.imports = {})

    _imports.react = this.imports.react(defaultVersion)
    _imports['react-dom'] = this.imports['react-dom'](defaultVersion)
    _imports['react-dom/server'] = this.imports['react-dom/server'](defaultVersion)

    this.store.setImportMap(importMap)
    this.store.forceSandboxReset()

    console.info('[@pinceau/repl] Has been reset to React mode.')
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
    return await compileFile(this.store, file)
  }

  async updatePreview(
    clearConsole: Ref<boolean>,
    runtimeError: Ref<string | null>,
    runtimeWarning: Ref<string | null>,
    ssr: boolean,
    proxy: PreviewProxy,
    previewOptions: any,
  ) {
    if (import.meta.env.PROD && clearConsole.value) { console.clear() }
    runtimeError.value = null
    runtimeWarning.value = null

    const isSSR = ssr || true

    try {
      const mainFile = this.store.state.mainFile

      // if SSR, generate the SSR bundle and eval it to render the HTML
      if (isSSR && (mainFile.endsWith('.jsx') || mainFile.endsWith('.tsx'))) {
        const ssrModules = compileModulesForPreview(this.store, true)

        console.log(`[@pinceau/repl] Successfully compiled ${ssrModules.length} modules for SSR.`)

        await proxy.eval([
          'const __modules__ = {};',
          'globalThis.require = (val) => { if (val === \'react-dom\') return ReactDOM }',
          ...ssrModules,
        `import 'react'
        import 'react-dom'
        import 'react-dom/server'

        const ReactDOM = window.ReactDOM
        const React = window.React

         const AppComponent = __modules__["${mainFile}"].default

         window.__ssr_promise__ = new Promise((resolve, reject) => {
          const div = document.createElement('div');

          const root = window.ReactDOM.createRoot(div);

          const component = React.createElement(AppComponent)

          window.ReactDOM.flushSync(() => {
           try {
            root.render(component);
           } catch (e) {
            reject(e)
           }
          });

          document.body.innerHTML = '<div id="app">' + div.innerHTML + '</div>' + \`${previewOptions?.bodyHTML || ''}\`

          resolve()
         }).catch(err => {
           console.error("SSR Error", err.message)
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
      if (mainFile.endsWith('.tsx')) {
        codeToEval.push(
        `import 'react'
        import 'react-dom'
        import 'react-dom/server'

        ${previewOptions?.customCode?.importCode || ''}
        
        const _mount = () => {
          const AppComponent = __modules__["${mainFile}"].default

          const rootEl = document.getElementById('app')

          const rootComp = React.createElement(AppComponent)
          
          ${isSSR && 'const root = window.__app__ = window.ReactDOM.hydrateRoot(rootEl, rootComp);\nconsole.log(\'[@pinceau/repl] React SSR HTML has been hydrated!\')'}
          ${!isSSR && 'const root = window.__app__ = window.ReactDOM.createRoot(rootEl).render(rootComp);'}
          
          ${previewOptions?.customCode?.useCode || ''}
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
