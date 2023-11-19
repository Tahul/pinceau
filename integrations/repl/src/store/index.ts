import { reactive, ref, shallowRef, watch } from 'vue'
import type { Ref, ShallowRef, WatchStopHandle } from 'vue'
import type { editor } from 'monaco-editor-core'
import type { PreviewProxy } from '../components/output/PreviewProxy'
import { ReplVueTransformer } from './vue'
import { ReplReactTransformer } from './react'
import { ReplSvelteTransformer } from './svelte'
import { PinceauProvider } from './pinceau'
import { SessionProvider } from './session'

export const importMapFile = 'import-map.json'
export const tsconfigFile = 'tsconfig.json'
export const playgroundConfigFile = 'config.json'
export const themeFile = 'src/theme.config.ts'
export const pinceauVersion = '1.0.0-beta.22'

const supportedTransformers = {
  vue: ReplVueTransformer,
  react: ReplReactTransformer,
  svelte: ReplSvelteTransformer,
}

export class File {
  filename: string
  code: string
  hidden: boolean
  compiled = {
    js: '',
    css: '',
    ssr: '',
  }

  editorViewState: editor.ICodeEditorViewState | null = null

  constructor(filename: string, code = '', hidden = false) {
    this.filename = filename
    this.code = code
    this.hidden = hidden
  }

  get language() {
    if (this.filename.endsWith('.vue')) { return 'vue' }

    if (this.filename.endsWith('.svelte')) { return 'svelte' }

    if (this.filename.endsWith('.html')) { return 'html' }

    if (this.filename.endsWith('.css')) { return 'css' }

    if (this.filename.endsWith('.ts') || this.filename.endsWith('.tsx') || this.filename.endsWith('.jsx')) { return 'typescript' }

    return 'javascript'
  }
}

export interface StoreState {
  mainFile?: string
  activeFile?: File
  files: Record<string, File>
  builtFiles: Record<string, File>
  errors: (string | Error)[]
  typescriptVersion: string
  locale?: string | undefined
}

export interface Store {
  initializing: Ref<boolean>
  sandboxCreating?: Promise<void>
  compiling: Ref<boolean>
  resetting: Ref<boolean>
  state: StoreState
  defaultTransformer?: keyof typeof supportedTransformers
  transformer?: ReplTransformer
  setTransformer?: (transformer: keyof typeof supportedTransformers) => Promise<void>
  pinceauProvider: PinceauProvider
  sessionId?: Ref<string | undefined>
  sessionProvider: SessionProvider
  layout: Ref<'horizontal' | 'vertical'>
  theme: Ref<'dark' | 'light'>
  showConfig: Ref<boolean>
  clearConsole: Ref<boolean>
  sandbox: ShallowRef<HTMLIFrameElement | undefined>
  previewProxy: ShallowRef<PreviewProxy | undefined>
  previewOptions: Ref<any>
  ssr: Ref<boolean>
  editor: typeof editor | undefined
  editorReady: Ref<boolean>
  effects: WatchStopHandle[]
  resetFlip: Ref<number>
  init: (options?: { updatePreview?: boolean }) => void
  compileFiles: () => Promise<void>
  setActive: (filename: string) => void
  addFile: (filename: string | File) => void
  deleteFile: (filename: string) => void
  renameFile: (oldFilename: string, newFilename: string) => void
  getImportMap: () => any
  getTsConfig?: () => any
  reset: (options: { transformer: keyof typeof supportedTransformers }) => Promise<this>
  reloadLanguageTools?: undefined | ((lang?: 'vue' | 'svelte' | 'react' | 'typescript') => void)
  runtimeError: Ref<string | null>
  runtimeWarning: Ref<string | null>
}

export interface StoreOptions {
  sessionId?: Ref<string | undefined>
  defaultTransformer?: keyof typeof supportedTransformers
  showOutput?: boolean
  clearConsole?: boolean
  previewOptions?: any
  theme?: 'dark' | 'light'
  ssr?: any
}

export interface ReplTransformer<
  CompilerType = any,
  CompilerOptions = any,
> {
  name: string
  store: ReplStore
  defaultVersion: string
  targetVersion?: string
  defaultMainFile: string
  welcomeCode: string
  tsconfig: any
  shims: Record<string, File>
  init: () => Promise<void>
  getTypescriptDependencies: (version?: string) => Record<string, string>
  compilerOptions: CompilerOptions
  compiler: CompilerType
  pendingImport: Promise<CompilerType> | null
  imports: { [key: string]: string | ((version: string) => string) }
  setVersion: (version: string) => Promise<void>
  resetVersion: () => void
  getDefaultImports: (version?: string) => Record<string, string>
  compileFile: (file: File) => Promise<(string | Error)[]>
  updatePreview: () => Promise<any>
}

export class ReplStore implements Store {
  defaultTransformer: keyof typeof supportedTransformers = 'vue'
  transformer?: ReplTransformer
  state: StoreState = reactive({
    builtFiles: {},
    errors: [],
    files: {},
    typescriptVersion: 'latest',
    mainFile: undefined,
    activeFile: undefined,
    locale: navigator.language,
  })

  initializing: Ref<boolean> = ref(true)
  compiling: Ref<boolean> = ref(true)
  resetting: Ref<boolean> = ref(false)
  effects: WatchStopHandle[] = []
  pinceauProvider: PinceauProvider
  sessionProvider: SessionProvider
  reloadLanguageTools: undefined | ((lang?: 'vue' | 'svelte' | 'react' | 'typescript') => void)
  editor: typeof editor | undefined = undefined
  editorReady: Ref<boolean> = ref(false)
  resetFlip: Ref<number> = ref(0)
  layout = ref<'vertical' | 'horizontal'>('vertical')
  showConfig = ref<boolean>(false)
  previewProxy: ShallowRef<PreviewProxy | undefined> = shallowRef(undefined)
  sandbox: ShallowRef<HTMLIFrameElement | undefined> = shallowRef(undefined)
  clearConsole: Ref<boolean> = ref(true)
  ssr: Ref<boolean> = ref(true)
  previewOptions: Ref<any> = ref({})
  theme: Ref<'dark' | 'light'> = ref('dark')
  runtimeError: Ref<string | null> = ref(null)
  runtimeWarning: Ref<string | null> = ref(null)
  sessionId: Ref<string | undefined> = ref(undefined)
  sandboxCreating?: Promise<void> | undefined

  constructor({
    sessionId,
    clearConsole = true,
    theme = 'dark',
  }: StoreOptions = {}) {
    if (typeof clearConsole !== 'undefined') { this.clearConsole.value = clearConsole }
    if (typeof theme !== 'undefined') { this.theme.value = theme }
    if (sessionId) { this.sessionId.value = sessionId.value }

    this.pinceauProvider = new PinceauProvider(this)
    this.sessionProvider = new SessionProvider(this)
  }

  async reset({ transformer }: { transformer?: keyof typeof supportedTransformers }) {
    this.resetting.value = true

    try {
      this.effects.forEach(e => e())

      this.editor?.getModels().forEach(model => model.dispose())

      this.state.files = {}

      this.sessionProvider.resetLocalStorage()

      this.defaultTransformer = transformer || this.defaultTransformer

      await this.init()

      await new Promise(r => setTimeout(r, 5000))
    }
    catch (e) {
      console.log({ e })
    }

    this.resetting.value = false

    return this
  }

  async compileFiles() {
    if (!this.transformer) { return }

    try {
      for (const file in this.state.files) {
        if (file !== this.state.mainFile) {
          const errs = await this.transformer.compileFile(this.state.files[file])
          if (errs.length) { this.state.errors.push(...errs) }
        }
      }

      if (this.state.mainFile) { await this.transformer.compileFile(this.state.files[this.state.mainFile]) }
    }
    catch (e) {
      console.log({ e })
    }
  }

  async init() {
    await this.sessionProvider.init()

    await this.pinceauProvider.init()

    if (!this.transformer) { return }

    const stopCompilerEffect = watch(
      () => this.state.activeFile?.code,
      async (newCode, oldCode) => {
        if (!this.previewProxy.value || !this.transformer) { return }
        if (!newCode || !this.state.activeFile) { return }
        if (newCode === oldCode) { return }

        this.compiling.value = true

        try {
          await this.transformer.compileFile(this.state.activeFile)
          await this.transformer.updatePreview()
        }
        catch (e) {
          console.log({ e })
        }

        this.sessionProvider.updateLocalStorageContent()

        this.compiling.value = false
      },
    )
    this.effects.push(stopCompilerEffect)

    const stopLanguageToolsEffect = watch(
      () => [
        this.state.files[tsconfigFile]?.code,
        this.state.typescriptVersion,
        this.state.locale,
      ],
      () => {
        if (!this.previewProxy.value || !this.transformer) { return }
        this.reloadLanguageTools?.(this.transformer.name as keyof typeof supportedTransformers)
      },
      { deep: true },
    )
    this.effects.push(stopLanguageToolsEffect)

    await this.transformer.updatePreview()

    this.state.errors = []

    this.initializing.value = false
  }

  getTsConfig() {
    try {
      return JSON.parse(this.state.files[tsconfigFile].code)
    }
    catch {
      return {}
    }
  }

  setActive(filename: string) {
    if (filename === playgroundConfigFile) { this.state.activeFile = new File('config.json', '{}', true) }
    if (!this.state.files[filename]) { return }
    this.state.activeFile = this.state.files[filename]
  }

  addFile(fileOrFilename: string | File): void {
    const file
      = typeof fileOrFilename === 'string'
        ? new File(fileOrFilename)
        : fileOrFilename
    this.state.files[file.filename] = file
    if (!file.hidden) { this.setActive(file.filename) }
  }

  deleteFile(filename: string) {
    if (
      // eslint-disable-next-line no-alert
      confirm(`Are you sure you want to delete ${stripSrcPrefix(filename)}?`)
    ) {
      if (this.state.mainFile && this.state.activeFile && this.state.activeFile.filename === filename) { this.state.activeFile = this.state.files[this.state.mainFile] }

      delete this.state.files[filename]
    }
  }

  renameFile(oldFilename: string, newFilename: string) {
    const { files } = this.state
    const file = files[oldFilename]

    if (!file) {
      this.state.errors = [`Could not rename "${oldFilename}", file not found`]
      return
    }

    if (!newFilename || oldFilename === newFilename) {
      this.state.errors = [`Cannot rename "${oldFilename}" to "${newFilename}"`]
      return
    }

    file.filename = newFilename

    const newFiles: Record<string, File> = {}

    // Preserve iteration order for files
    for (const name in files) {
      if (name === oldFilename) { newFiles[newFilename] = file }
      else { newFiles[name] = files[name] }
    }

    this.state.files = newFiles

    if (this.state.mainFile === oldFilename) { this.state.mainFile = newFilename }

    if (this.transformer) { this.transformer.compileFile(file).then(errs => (this.state.errors = errs)) }
  }

  getFiles() {
    const exported: Record<string, string> = {}
    for (const filename in this.state.files) {
      exported[filename] = this.state.files[filename].code
    }
    return exported
  }

  forceSandboxReset() {
    this.resetFlip.value = this.resetFlip.value + 1
  }

  getBaseMap(reset: boolean = false) {
    let map = this.state?.files?.[importMapFile]

    if (!map || reset) {
      map = new File(
        importMapFile,
        JSON.stringify(
          {
            imports: {
              ...(this.transformer?.getDefaultImports() || {}),
            },
          },
          null,
          2,
        ),
      )
    }
    else {
      try {
        const json = JSON.parse(map.code)

        if (!json.imports) { json.imports = {} }

        json.imports = {
          ...(this.transformer?.getDefaultImports() || {}),
          ...json.imports,
        }

        map.code = JSON.stringify(json, null, 2)
      }
      catch (e) {
        //
      }
    }

    return map
  }

  getImportMap() {
    try {
      if (!this.state.files[importMapFile]) { return {} }
      return JSON.parse(this.state.files?.[importMapFile]?.code || '{}')
    }
    catch (e) {
      this.state.errors = [`Syntax error in import-map.json: ${(e as Error).message}`]
      return {}
    }
  }

  setImportMap(map: {
    imports: Record<string, string>
    scopes?: Record<string, Record<string, string>>
    styles?: Record<string, string>
  }) {
    this.state.files[importMapFile]!.code = JSON.stringify(map, null, 2)
  }

  setTypeScriptVersion(version: string) {
    this.state.typescriptVersion = version
    console.info(`[@pinceau/repl] Now using TypeScript version: ${version}`)
  }

  async setTransformer(transformer: keyof typeof supportedTransformers) {
    this.transformer = new supportedTransformers[transformer]({ store: this })
    await this.transformer.init()
  }
}

export function setFile(
  files: Record<string, File>,
  filename: string,
  content: string,
) {
  // prefix user files with src/
  // for cleaner Volar path completion when using Monaco editor
  const normalized
    = filename !== importMapFile
    && filename !== tsconfigFile
    && filename !== themeFile
    && !filename.startsWith('src/')
      ? `src/${filename}`
      : filename

  files[normalized] = new File(normalized, content)
}

export function stripSrcPrefix(file: string) {
  return file.replace(/^src\//, '')
}
