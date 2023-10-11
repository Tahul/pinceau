import { jsDelivrUriBase } from '@volar/cdn'
import * as volar from '@volar/monaco'
import { Uri, editor, languages } from 'monaco-editor-core'
import * as onigasm from 'onigasm'
import onigasmWasm from 'onigasm/lib/onigasm.wasm?url'
import { watchEffect } from 'vue'
import type { Store } from '../../store'
import { getOrCreateModel } from './utils'
import type { CreateData } from './volar.worker'
import volarWorker from './volar.worker?worker'

let initted = false
export function initMonaco(store: Store) {
  if (initted) { return }
  loadMonacoEnv(store)
  loadWasm()

  watchEffect(() => {
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

    for (const filename in store.transformer.shims) {
      const file = store.transformer.shims[filename]
      if (editor.getModel(Uri.parse(`file:///${file.filename}`))) { continue }
      getOrCreateModel(
        Uri.parse(`file:///${file.filename}`),
        file.language,
        file.code,
      )
    }

    // dispose of any models that are not in the store
    for (const model of editor.getModels()) {
      const uri = model.uri.toString()
      if (store.state.files[uri.substring('file:///'.length)]) { continue }
      if (store.transformer.shims[uri.substring('file:///'.length)]) { continue }
      if (uri.startsWith(`${jsDelivrUriBase}/`)) { continue }
      if (uri.startsWith('inmemory://')) { continue }
      model.dispose()
    }
  })

  // Support for go to definition
  editor.registerEditorOpener({
    openCodeEditor(_, resource) {
      if (resource.toString().startsWith(`${jsDelivrUriBase}/`)) { return true }

      const path = resource.path
      if (/^\//.test(path)) {
        const fileName = path.replace('/', '')
        if (fileName !== store.state.activeFile.filename) {
          store.setActive(fileName)
          return true
        }
      }

      return false
    },
  })

  initted = true
}

let disposeWorker: undefined | (() => void)
export async function reloadLanguageTools(store: Store, lang?: 'vue' | 'svelte' | 'react' | 'typescript') {
  disposeWorker?.()

  let dependencies: Record<string, string> = {
    ...store.state.dependencyVersion,
  }

  if (store.transformer && store.transformer.targetVersion) {
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
    label: lang,
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
    ...Object.keys(store.transformer.shims),
  ].map((filename) => {
    return Uri.parse(`file:///${filename}`)
  })

  let disposeMarkers: () => void | undefined
  if (lang === 'vue' || lang === 'svelte') {
    const { dispose: _disposeMarkers } = volar.editor.activateMarkers(
      worker,
      languageId,
      'vue',
      getSyncUris,
      editor,
    )
    disposeMarkers = _disposeMarkers
  }

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

  disposeWorker = () => {
    disposeMarkers?.()
    disposeAutoInsertion?.()
    disposeProvides?.()
    worker?.dispose()
  }
}

export interface WorkerMessage {
  event: 'init'
  tsVersion: string
  language: string
  tsLocale?: string
}

export function loadMonacoEnv(store: Store) {
  // eslint-disable-next-line no-restricted-globals
  ;(self as any).MonacoEnvironment = {
    async getWorker(_: any, label: string) {
      const worker = new volarWorker()
      const init = new Promise<void>((resolve) => {
        worker.addEventListener('message', (data) => {
          if (data.data === 'inited') { resolve() }
        })
        worker.postMessage({
          event: 'init',
          tsVersion: store.state.typescriptVersion,
          tsLocale: store.state.locale,
          language: label,
        } satisfies WorkerMessage)
      })
      await init
      return worker
    },
  }
  languages.register({ id: 'vue', extensions: ['.vue'] })
  languages.register({ id: 'javascript', extensions: ['.js'] })
  languages.register({ id: 'typescript', extensions: ['.ts'] })
  languages.register({ id: 'jsx', extensions: ['.jsx', '.tsx'] })
  languages.register({ id: 'svelte', extensions: ['.svelte'] })

  store.reloadLanguageTools = (lang?: 'vue' | 'react' | 'svelte' | 'typescript') => reloadLanguageTools(store, lang)

  languages.onLanguage('vue', () => store.reloadLanguageTools!('vue'))
  languages.onLanguage('typescript', () => store.reloadLanguageTools!('typescript'))
  languages.onLanguage('jsx', () => store.reloadLanguageTools!('react'))
  languages.onLanguage('svelte', () => store.reloadLanguageTools!('svelte'))
}

export function loadWasm() {
  return onigasm.loadWASM(onigasmWasm)
}

export class WorkerHost {
  onFetchCdnFile(uri: string, text: string) {
    getOrCreateModel(Uri.parse(uri), undefined, text)
  }
}
