import { jsDelivrUriBase } from '@volar/cdn'
import * as volar from '@volar/monaco'
import { Uri, editor, languages } from 'monaco-editor-core'
import * as onigasm from 'onigasm'

// @ts-ignore
import onigasmWasm from 'onigasm/lib/onigasm.wasm?url'
import { watch } from 'vue'
import type { Store } from '../../store'
import { pinceauVersion } from '../../store'
import { getOrCreateModel } from './utils'
import type { CreateData } from './volar.worker'

// @ts-ignore
import volarWorker from './volar.worker?worker'

export async function initMonaco(store: Store) {
  console.log('init monaco!')

  store.editor = editor

  if (!store.editorReady.value) {
    loadMonacoEnv(store)
    await loadWasm()

    // Support for go to definition
    editor.registerEditorOpener({
      openCodeEditor(_, resource) {
        if (resource.toString().startsWith(`${jsDelivrUriBase}/`)) { return true }

        const path = resource.path
        if (/^\//.test(path)) {
          const fileName = path.replace('/', '')
          if (fileName !== store.state.activeFile?.filename) {
            store.setActive(fileName)
            return true
          }
        }

        return false
      },
    })
  }

  const shimsSyncEffect = watch(
    () => store.transformer?.shims,
    (files) => {
      if (!store.transformer || store.initializing.value || !files || !Object.keys(files).length) { return }

      console.log('sync shims!')

      for (const filename in store.transformer.shims) {
        const file = store.transformer.shims[filename]
        getOrCreateModel(
          Uri.parse(`file:///${file.filename}`),
          file.language,
          file.code,
        )
      }
    },
    {
      deep: true,
      immediate: true,
    },
  )

  const themeSyncEffect = watch(
    () => store.state.builtFiles,
    (files) => {
      if (!store.transformer || store.initializing.value || !Object.keys(files).length) { return }

      console.log('sync theme!')

      for (const filename in store.state.builtFiles) {
        const file = store.state.builtFiles[filename]

        if (filename === '@pinceau/outputs') {
          getOrCreateModel(
            Uri.parse(`https://cdn.jsdelivr.net/npm/@pinceau/outputs@${pinceauVersion}/index.d.ts`),
            file.language,
            file.code,
          )
        }

        if (filename === '@pinceau/outputs/theme-ts') {
          getOrCreateModel(
            Uri.parse(`https://cdn.jsdelivr.net/npm/outputs@${pinceauVersion}/theme.d.ts`),
            file.language,
            file.code,
          )
        }

        if (filename === '@pinceau/outputs/utils-ts') {
          getOrCreateModel(
            Uri.parse(`https://cdn.jsdelivr.net/npm/outputs@${pinceauVersion}/utils.d.ts`),
            file.language,
            file.code,
          )
        }
      }
    },
    {
      immediate: true,
      deep: true,
    },
  )

  const modelSyncEffect = watch(
    () => store.state.files,
    (files) => {
      if (!store.transformer || store.initializing.value || !Object.keys(files).length) { return }

      // create a model for each file in the store
      for (const filename in store.state.files) {
        const file = store.state.files[filename]
        if (editor.getModel(Uri.parse(`file:///${filename}`))) { continue }
        getOrCreateModel(
          Uri.parse(`file:///${filename}`),
          file.language,
          file.code,
        )
      }

      // dispose of any models that are not in the store
      for (const model of editor.getModels()) {
        const uri = model.uri.toString()
        if (!store.state.files) { continue }
        if (uri.includes('@pinceau/outputs')) { continue }
        if (store.state.files[uri.substring('file:///'.length)]) { continue }
        if (store.transformer?.shims?.[uri.substring('file:///'.length)]) { continue }
        if (uri.startsWith(`${jsDelivrUriBase}/`)) { continue }
        if (uri.startsWith('inmemory://')) { continue }
        model.setValue('')
        model.dispose()
      }
    },
    {
      immediate: true,
    },
  )

  store.effects.push(modelSyncEffect)
  store.effects.push(shimsSyncEffect)
  store.effects.push(themeSyncEffect)

  store.editorReady.value = true
}

let disposeWorker: undefined | (() => void)
export async function reloadLanguageTools(store: Store, lang?: 'vue' | 'svelte' | 'react' | 'typescript') {
  disposeWorker?.()

  let dependencies: Record<string, string> = {}

  if (store.transformer) {
    dependencies = {
      ...dependencies,
      ...store.transformer.getTypescriptDependencies(),
    }
  }

  if (store.state.typescriptVersion) {
    dependencies = {
      ...dependencies,
      typescript: store.state.typescriptVersion,
    }
  }

  const worker = editor.createWebWorker<any>({
    moduleId: 'vs/language/volar/volarWorker',
    label: 'vue',
    host: new WorkerHost(),
    createData: {
      tsconfig: store.getTsConfig?.() || {},
      dependencies,
      language: lang,
    } satisfies CreateData,
  })

  const languageId = ['vue', 'svelte', 'javascript', 'typescript']

  const getSyncUris = () => [
    ...Object.keys(store.state.files),
    ...Object.keys(store.transformer?.shims || {}),

  ].map((filename) => {
    return Uri.parse(`file:///${filename}`)
  })

  const { dispose: disposeMarkers } = volar.editor.activateMarkers(
    worker,
    languageId,
    'vue',
    getSyncUris,
    editor,
  )

  const { dispose: disposeAutoInsertion } = volar.editor.activateAutoInsertion(
    worker,
    languageId,
    getSyncUris,
    editor,
  )

  const { dispose: disposeProvides } = await volar.languages.registerProviders(
    worker,
    languageId,
    getSyncUris,
    languages,
  )

  disposeWorker = async () => {
    disposeMarkers?.()
    disposeAutoInsertion?.()
    disposeProvides?.()
  }
}

export interface WorkerMessage {
  event: 'init'
  tsVersion: string
  language: string
  tsLocale?: string
  builtFiles: string
}

export function loadMonacoEnv(store: Store) {
  // eslint-disable-next-line no-restricted-globals
  ; (self as any).MonacoEnvironment = {
    async getWorker(_: any, label: string) {
      const worker = new volarWorker()
      const init = new Promise<void>((resolve) => {
        const builtFiles = JSON.stringify(store.state.builtFiles)

        worker.addEventListener('message', (data) => {
          if (data.data === 'inited') { resolve() }
        })

        worker.postMessage({
          event: 'init',
          tsVersion: store.state.typescriptVersion,
          tsLocale: store.state.locale,
          language: label,
          builtFiles,
        } satisfies WorkerMessage)
      })
      await init
      return worker
    },
  }

  languages.register({ id: 'vue', extensions: ['.vue'] })
  languages.register({ id: 'javascript', extensions: ['.js'] })
  languages.register({ id: 'typescript', extensions: ['.ts', '.jsx', '.tsx'] })
  languages.register({ id: 'svelte', extensions: ['.svelte'] })

  store.reloadLanguageTools = (lang?: 'vue' | 'react' | 'svelte' | 'typescript') => reloadLanguageTools(store, lang)

  if (store.transformer?.name === 'vue') { languages.onLanguage('vue', () => store.reloadLanguageTools!('vue')) }
  if (store.transformer?.name === 'svelte') { languages.onLanguage('svelte', () => store.reloadLanguageTools!('svelte')) }
  if (store.transformer?.name === 'react') { languages.onLanguage('typescript', () => store.reloadLanguageTools!('typescript')) }
}

export function loadWasm() {
  return onigasm.loadWASM(onigasmWasm)
}

export class WorkerHost {
  onFetchCdnFile(uri: string, text: string) {
    getOrCreateModel(Uri.parse(uri), undefined, text)
  }
}
