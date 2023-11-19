import { createReactPlugin, pluginTypes } from '@pinceau/react/utils'
import { compileFile } from '../transforms'
import { compileModulesForPreview, processModule } from '../compiler'
import type { ReplStore, ReplTransformer } from '.'
import { File, pinceauVersion, tsconfigFile } from '.'

const defaultMainFile = 'src/App.tsx'

const welcomeCode = `
export default () => {
  return <div>Hello World</div>
}
`.trim()

const defaultVersion = '18.2.0'

const localImports = {
  'react': (version = defaultVersion) => `https://esm.sh/react@${version}?dev`,
  'react/jsx-runtime': (version = defaultVersion) => `https://esm.sh/react@${version}/jsx-runtime?dev`,
  'react-dom': (version = defaultVersion) => `https://esm.sh/react-dom@${version}?dev`,
  'react-dom/client': (version = defaultVersion) => `https://esm.sh/react-dom@${version}/client?dev`,
  'react-dom/server': (version = defaultVersion) => `https://esm.sh/react-dom@${version}/server?dev`,
  '@types/react': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/@types/react@${version}/index.d.ts`,
  '@types/react-dom': (version = defaultVersion) => `https://cdn.jsdelivr.net/npm/@types/react-dom@${version}/index.d.ts`,
  'defu': () => 'https://cdn.jsdelivr.net/npm/defu@6.1.2/dist/defu.mjs',
  'scule': () => 'https://cdn.jsdelivr.net/npm/scule@1.0.0/dist/index.mjs',
  '@pinceau/runtime': () => `https://cdn.jsdelivr.net/npm/@pinceau/runtime@${pinceauVersion}/dist/index.mjs`,
  '@pinceau/stringify': () => `https://cdn.jsdelivr.net/npm/@pinceau/stringify@${pinceauVersion}/dist/index.mjs`,
  '@pinceau/core/runtime': () => `https://cdn.jsdelivr.net/npm/@pinceau/core@${pinceauVersion}/dist/runtime.mjs`,
  '@pinceau/theme/runtime': () => `https://cdn.jsdelivr.net/npm/@pinceau/theme@${pinceauVersion}/dist/runtime.mjs`,
  '@pinceau/react/runtime': () => `https://cdn.jsdelivr.net/npm/@pinceau/react@${pinceauVersion}/dist/runtime.mjs`,
  '@pinceau/outputs/react-plugin': () => './react-plugin-proxy.js',
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
    'globals.d.ts': new File('globals.d.ts', `
import * as React from 'react'
import * as ReactDOM from 'react-dom'

declare global {
    const React: typeof React
    const ReactDOM: typeof ReactDOM
}

export {}
`),
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
      types: ['@types/react', '@types/react-dom', '@pinceau/outputs'],
    },
  }

  constructor({ store }: { store: ReplStore }) {
    this.store = store

    this.store.pinceauProvider.pinceauContext.addTypes(pluginTypes)

    this.store.state.files[tsconfigFile] = new File(
      tsconfigFile,
      JSON.stringify(this.tsconfig, null, 2),
    )
  }

  async init() {
    //
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

    const reactPlugin = createReactPlugin(this.store.pinceauProvider.pinceauContext)

    return [
      processModule(
        this.store,
        reactPlugin,
        '@pinceau/outputs/react-plugin',
      ).code,
      ...modules,
    ]
  }

  async compileFile(file: File): Promise<(string | Error)[]> {
    return await compileFile(this.store, file)
  }

  async updatePreview() {
    if (!this.store.previewProxy.value) { return }
    if ((import.meta as any).env.PROD && this.store.clearConsole.value) { console.clear() }

    this.store.runtimeError.value = null
    this.store.runtimeWarning.value = null

    const isSSR = this.store.ssr.value || true

    try {
      const mainFile = this.store.state.mainFile

      // if SSR, generate the SSR bundle and eval it to render the HTML
      if (isSSR && (mainFile && (mainFile.endsWith('.jsx') || mainFile.endsWith('.tsx')))) {
        const ssrModules = compileModulesForPreview(this.store, true)

        console.log(`[@pinceau/repl] Successfully compiled ${ssrModules.length} modules for SSR.`)

        await this.store.previewProxy.value.eval([
          'const __modules__ = {};',
          ...this.getBuiltFilesModules(),
          ...ssrModules,
        `
        import * as React from \'react\'
        import * as ReactDOM from \'react-dom\'
        import { createRoot } from \'react-dom/client\'
        import * as ReactDOMServer from \'react-dom/server\'
        import { PinceauProvider } from "@pinceau/outputs/react-plugin"

        window.React = React
        window.ReactDOM = ReactDOM

         const AppComponent = __modules__["${mainFile}"].default

         window.__ssr_promise__ = new Promise((resolve, reject) => {
          const div = document.createElement('div');

          const root = createRoot(div);

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

          ReactDOM.flushSync(() => {
           try {
            root.render(component);
           } catch (e) {
            reject(e)
           }
          });

          if (ssrUtils) { document.getElementById('pinceau-runtime').innerHTML = ssrUtils.toString() }

          document.body.innerHTML = '<div id="app">' + div.innerHTML + '</div>' + \`${this.store.previewOptions.value?.bodyHTML || ''}\`

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
        'import \'react\'\nimport \'react-dom\'\nimport \'react-dom/server\'\n',
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
      if (mainFile?.endsWith('.tsx')) {
        codeToEval.push(
        `
        import * as React from \'react\'
        import * as ReactDOM from \'react-dom\'
        import { hydrateRoot } from \'react-dom/client\'
        import * as ReactDOMServer from \'react-dom/server\'
        import { PinceauProvider } from "@pinceau/outputs/react-plugin"
        ${this.store.previewOptions.value?.customCode?.importCode || ''}
        
        const _mount = () => {
          const AppComponent = __modules__["${mainFile}"].default

          const rootEl = document.getElementById('app')

          const rootComp = React.createElement(
            PinceauProvider,
            {
              children: React.createElement(AppComponent)
            }
          )
          
          ${isSSR && 'const root = window.__app__ = hydrateRoot(rootEl, rootComp);\nconsole.log(\'[@pinceau/repl] React SSR HTML has been hydrated!\')'}
          ${!isSSR && 'const root = window.__app__ = ReactDOM.createRoot(rootEl).render(rootComp);'}
          
          ${this.store.previewOptions.value?.customCode?.useCode || ''}
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
