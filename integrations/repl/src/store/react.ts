import type { Ref } from 'vue'
import { compileFile } from '../transforms'
import { compileModulesForPreview } from '../compiler'
import type { PreviewProxy } from '../components/output/PreviewProxy'
import type { ReplStore, ReplTransformer } from '.'
import { File, pinceauVersion } from '.'

const defaultMainFile = 'src/App.tsx'

const welcomeCode = `
export default () => {
  return <div>Hello World</div>
}
`.trim()

const defaultVersion = '18.2.0'

const localImports = {
  'react': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/react@${version}/umd/react.development.js`,
  'react/jsx-runtime': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/react@${version}/jsx-runtime.js`,
  'react-dom': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/react-dom@${version}/umd/react-dom.development.js`,
  'react-dom/client': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/react-dom@${version}/client.js`,
  'react-dom/server': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/react-dom@${version}/umd/react-dom-server.browser.development.js`,
  '@types/react': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/@types/react@${version}/index.d.ts`,
  '@types/react-dom': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/@types/react-dom@${version}/index.d.ts`,
  'defu': () => 'https://cdn.jsdelivr.net/npm/defu@6.1.2/dist/defu.mjs',
  'scule': () => 'https://cdn.jsdelivr.net/npm/scule@1.0.0/dist/index.mjs',
  '@pinceau/runtime': () => `https://cdn.jsdelivr.net/npm/@pinceau/runtime@${pinceauVersion}/dist/index.mjs`,
  '@pinceau/stringify': () => `https://cdn.jsdelivr.net/npm/@pinceau/stringify@${pinceauVersion}/dist/index.mjs`,
  '@pinceau/core/runtime': () => `https://cdn.jsdelivr.net/npm/@pinceau/core@${pinceauVersion}/dist/runtime.mjs`,
  '@pinceau/theme/runtime': () => `https://cdn.jsdelivr.net/npm/@pinceau/theme@${pinceauVersion}/dist/runtime.mjs`,
  '@pinceau/react/runtime': () => `https://cdn.jsdelivr.net/npm/@pinceau/vue@${pinceauVersion}/dist/runtime.mjs`,
  '$pinceau/react-plugin': () => '/react-plugin-proxy.js',
}

export class ReplReactTransformer implements ReplTransformer<null, {}> {
  name: string = 'react'
  store: ReplStore
  defaultMainFile: string = defaultMainFile
  welcomeCode: string = welcomeCode
  defaultVersion: string = defaultVersion
  targetVersion?: string
  compiler = null
  compilerOptions: {} = {}
  pendingImport: Promise<any> | null = null
  imports: typeof localImports = localImports
  shims = {
    'globals.d.ts': new File('globals.d.ts', `import * as React from 'react'
import * as ReactDOM from 'react-dom'
import type { ReactStyledComponentFactory } from \'@pinceau/react\'
import { SupportedHTMLElements } from \'@pinceau/style\'

export {}

declare global {
    const React: typeof React
    const ReactDOM: typeof ReactDOM
    export const $styled: { [Type in SupportedHTMLElements]: ReactStyledComponentFactory<Type> }
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
      types: ['@types/react', '@types/react-dom'],
    },
  }

  constructor({ store }: { store: ReplStore }) {
    this.store = store
  }

  getTypescriptDependencies() {
    return {
      '@types/react': this.targetVersion || this.defaultVersion,
      '@types/react-dom': this.targetVersion || this.defaultVersion,
      '@pinceau/style': pinceauVersion,
      '@pinceau/theme': pinceauVersion,
      '@pinceau/runtime': pinceauVersion,
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

    importMap.imports = newImports

    this.store.setImportMap(importMap)
    this.store.forceSandboxReset()
    this.store.reloadLanguageTools?.()

    console.info(`[@pinceau/repl] Now using React version: ${version}`)
  }

  resetVersion() {
    this.targetVersion = undefined

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
    if ((import.meta as any).env.PROD && clearConsole.value) { console.clear() }
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
        import { PinceauProvider, PinceauContext } from '$pinceau/react-plugin'

        const ReactDOM = window.ReactDOM
        const React = window.React

         const AppComponent = __modules__["${mainFile}"].default

         window.__ssr_promise__ = new Promise((resolve, reject) => {
          const div = document.createElement('div');

          const root = window.ReactDOM.createRoot(div);

          let ssrUtils
          const cb = (_ssr) => {
            ssrUtils = _ssr
          }

          const component = React.createElement(
            PinceauProvider,
            {
              children: React.createElement(AppComponent),
              cb
            }
          )

          window.ReactDOM.flushSync(() => {
           try {
            root.render(component);
           } catch (e) {
            reject(e)
           }
          });

          if (ssrUtils) { document.getElementById('pinceau-runtime').innerHTML = ssrUtils.toString() }

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
        import { PinceauProvider } from '$pinceau/react-plugin'

        ${previewOptions?.customCode?.importCode || ''}
        
        const _mount = () => {
          const AppComponent = __modules__["${mainFile}"].default

          const rootEl = document.getElementById('app')

          const rootComp = React.createElement(
            PinceauProvider,
            {
              children: React.createElement(AppComponent)
            }
          )
          
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
