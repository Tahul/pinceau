import palette from '@pinceau/palette/theme.config?raw'
import type { ReplStore, StoreState } from '..'
import { File, importMapFile, setFile, themeFile, tsconfigFile } from '.'

const API_URL = import.meta.env?.PINCEAU_API_URL || 'https://pinceau-functions.yael.dev/'

async function fetchFunction(fn: 'pinceau-playground') {
  const response = await fetch(`${API_URL}?functionId=${fn}`).then(r => r.json())

  let body
  try {
    body = JSON.parse(response.body.responseBody)
  }
  catch (_) {
    //
  }

  return body
}

export class SessionProvider {
  store: ReplStore

  constructor(store: ReplStore) {
    this.store = store
  }

  async init() {
    const localStorageContent = this.getLocalStorageContent()

    const files: StoreState['files'] = {}

    if (localStorageContent) {
      await this.syncFromLocalStorage(files)

      await this.store.compileFiles()

      return
    }

    if (!this.store.transformer) {
      await this.store.setTransformer(this.store.defaultTransformer)
    }

    if (!this.store.sessionId.value && this.store.transformer) {
      // Set main file from transformer
      setFile(files, this.store.transformer.defaultMainFile, this.store.transformer.welcomeCode)

      // Set main theme file from palette
      setFile(files, themeFile, palette)

      files[tsconfigFile] = new File(tsconfigFile, JSON.stringify(this.store.transformer.tsconfig, null, 2))

      files[importMapFile] = this.store.getBaseMap()

      this.store.state.files = files

      this.store.state.mainFile = this.store.transformer.defaultMainFile

      this.store.setActive(this.store.transformer.defaultMainFile)

      await this.store.compileFiles()

      return
    }

    const result = await fetchFunction('pinceau-playground')

    console.log(result)
  }

  updateLocalStorageContent() {
    if (!this.store.transformer) { return }

    const files = this.store.getFiles()

    localStorage.setItem(
      'pinceau-playground-current-content',
      JSON.stringify({
        transformer: this.store.transformer.name,
        activeFileName: this.store.state.activeFile?.filename,
        mainFile: this.store.state.mainFile,
        files,
      }),
    )
  }

  getLocalStorageContent() {
    if (localStorage.getItem('pinceau-playground-current-content')) {
      const data = localStorage.getItem('pinceau-playground-current-content')
      let result
      try {
        result = JSON.parse(data as string)
      }
      catch { }
      return result
    }
  }

  async syncFromLocalStorage(files: StoreState['files'] = this.store.state.files) {
    const content = this.getLocalStorageContent()

    if (content.transformer) { await this.store.setTransformer(content.transformer) }

    if (content.files) {
      for (const file in content.files) {
        const code = content.files[file]
        setFile(files, file, code)
      }
      this.store.state.files = files
    }

    if (content.activeFileName) { this.store.setActive(content.activeFileName) }

    if (content.mainFile) { this.store.state.mainFile = content.mainFile }
    else { this.store.state.mainFile = this.store.transformer?.defaultMainFile }
  }

  resetLocalStorage() {
    localStorage.removeItem('pinceau-playground-current-content')
  }
}
