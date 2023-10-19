import { nextTick, reactive, ref, watch, watchEffect } from 'vue'
import type { Ref, WatchStopHandle } from 'vue'
import type { editor } from 'monaco-editor-core'
import palette from '@pinceau/palette/theme.config?raw'
import { atou, utoa } from '../utils'
import type { OutputModes } from '../components/output/types'
import type { PreviewProxy } from '../components/output/PreviewProxy'
import { ReplVueTransformer } from './vue'
import { ReplReactTransformer } from './react'
import { ReplSvelteTransformer } from './svelte'
import { PinceauProvider } from './pinceau'

export const importMapFile = 'import-map.json'
export const tsconfigFile = 'tsconfig.json'
export const themeFile = 'theme.config.ts'
export const pinceauVersion = '1.0.0-beta.16'

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
  mainFile: string
  files: Record<string, File>
  builtFiles: Record<string, File>
  activeFile: File
  errors: (string | Error)[]
  typescriptVersion: string
  locale?: string | undefined
  /** \{ dependencyName: version \} */
  dependencyVersion?: Record<string, string>
}

export interface Store {
  state: StoreState
  transformer: ReplTransformer
  pinceauProvider: PinceauProvider
  editor: typeof editor | undefined
  effects: WatchStopHandle[]
  resetFlip: Ref<number>
  init: () => void
  setActive: (filename: string) => void
  addFile: (filename: string | File) => void
  deleteFile: (filename: string) => void
  renameFile: (oldFilename: string, newFilename: string) => void
  getImportMap: () => any
  getTsConfig?: () => any
  reset: (options: StoreOptions) => Promise<Store>
  reloadLanguageTools?: undefined | ((lang?: 'vue' | 'svelte' | 'react' | 'typescript') => void)
  initialShowOutput: boolean
  initialOutputMode: OutputModes
}

export interface StoreOptions {
  transformer?: 'vue' | 'react' | 'svelte'
  serializedState?: string
  showOutput?: boolean
  // loose type to allow getting from the URL without inducing a typing error
  outputMode?: OutputModes | string
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
  getTypescriptDependencies: (version?: string) => Record<string, string>
  compilerOptions: CompilerOptions
  compiler: CompilerType
  pendingImport: Promise<CompilerType> | null
  imports: { [key: string]: string | ((version: string) => string) }
  setVersion: (version: string) => Promise<void>
  resetVersion: () => void
  getDefaultImports: (version?: string) => Record<string, string>
  compileFile: (file: File) => Promise<(string | Error)[]>
  updatePreview: (
    clearConsole: Ref<boolean>,
    runtimeError: Ref<string | null>,
    runtimeWarning: Ref<string | null>,
    ssr: boolean,
    proxy: PreviewProxy,
    previewOptions: any,
  ) => Promise<any>
}

export class ReplStore implements Store {
  state: StoreState
  effects: WatchStopHandle[] = []
  transformer: ReplTransformer
  pinceauProvider: PinceauProvider
  initialShowOutput: boolean
  initialOutputMode: OutputModes
  reloadLanguageTools: undefined | ((lang?: 'vue' | 'svelte' | 'react' | 'typescript') => void)
  editor: typeof editor | undefined = undefined
  resetFlip: Ref<number> = ref(0)

  constructor({
    transformer,
    serializedState = '',
    showOutput = false,
    outputMode = 'preview',
  }: StoreOptions = {}) {
    let serializedFiles: { [key: string]: string } | undefined
    if (serializedState) {
      const { files, transformer: serializedTransformer } = JSON.parse(atou(serializedState))
      if (files) { serializedFiles = files }
      if (serializedTransformer) { transformer = serializedTransformer }
    }

    const files: StoreState['files'] = {}

    if (serializedFiles) { for (const filename in serializedFiles) { setFile(files, filename, serializedFiles[filename]) } }

    // Set theme.config
    if (!serializedFiles || !serializedFiles['theme.config.ts']) { setFile(files, themeFile, palette) }

    this.pinceauProvider = new PinceauProvider(this)

    if (transformer) { this.transformer = new supportedTransformers[transformer]({ store: this }) }
    else { throw new Error('You must provide a transformer for the Repl to boot properly.') }

    // Set main fail from transformer
    if (!serializedFiles) { setFile(files, this.transformer.defaultMainFile, this.transformer.welcomeCode) }

    this.initialShowOutput = showOutput
    this.initialOutputMode = outputMode as OutputModes

    // Set main file
    let mainFile = this.transformer?.defaultMainFile
    if (!files[mainFile]) { mainFile = Object.keys(files)[0] }

    this.state = reactive({
      mainFile,
      files,
      builtFiles: {},
      activeFile: files[mainFile],
      errors: [],
      typescriptVersion: 'latest',
      resetFlip: 0,
    })

    this.initImportMap()
    this.initTsConfig()
  }

  async reset({
    transformer,
    showOutput = false,
    outputMode = 'preview',
  }: StoreOptions) {
    if (transformer) { this.transformer = new supportedTransformers[transformer]({ store: this }) }
    else { throw new Error('You must provide a transformer for the Repl to boot properly.') }

    this.effects.forEach(cancel => cancel())

    const files: StoreState['files'] = {}

    setFile(files, this.transformer.defaultMainFile, this.transformer.welcomeCode)

    this.initialShowOutput = showOutput
    this.initialOutputMode = outputMode as OutputModes

    // Set main file
    let mainFile = this.transformer?.defaultMainFile
    if (!files[mainFile]) { mainFile = Object.keys(files)[0] }

    const newState = {
      mainFile,
      files,
      activeFile: files[mainFile],
      errors: [],
      typescriptVersion: 'latest',
    }

    for (const key in newState) {
      this.state[key] = newState[key]
    }

    this.initImportMap(true)
    this.initTsConfig(true)
    this.reloadLanguageTools?.(transformer)
    this.init()
    this.forceSandboxReset()

    setTimeout(() => {
      window?.location?.reload()
    }, 1000)

    return this
  }

  // Don't start compiling until the options are set
  init() {
    const stopCompilerEffect = watchEffect(
      () => (this.transformer.compileFile(this.state.activeFile).then(errs => (this.state.errors = errs))),
    )

    const stopLanguageToolsEffect = watch(
      () => [
        this.state.files[tsconfigFile]?.code,
        this.state.typescriptVersion,
        this.state.locale,
        this.state.dependencyVersion,
      ],
      () => this.reloadLanguageTools?.(this.transformer.name as keyof typeof supportedTransformers),
      { deep: true },
    )

    this.state.errors = []
    for (const file in this.state.files) {
      if (file !== this.transformer.defaultMainFile) {
        this.transformer.compileFile(this.state.files[file]).then(errs =>
          this.state.errors.push(...errs),
        )
      }
    }

    this.effects = [stopCompilerEffect, stopLanguageToolsEffect]
  }

  initTsConfig(reset: boolean = false) {
    if (!this.state.files[tsconfigFile] || reset) { this.setTsConfig(this.transformer.tsconfig) }
  }

  setTsConfig(config: any) {
    this.state.files[tsconfigFile] = new File(
      tsconfigFile,
      JSON.stringify(config, undefined, 2),
    )
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
      if (this.state.activeFile.filename === filename) { this.state.activeFile = this.state.files[this.state.mainFile] }

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

    this.transformer.compileFile(file).then(errs => (this.state.errors = errs))
  }

  serialize() {
    const files = this.getFiles()
    const importMap = files[importMapFile]

    if (importMap) {
      const defaultImports = this.transformer.getDefaultImports()

      const { imports } = JSON.parse(importMap)

      for (const importName of Object.keys(defaultImports)) {
        if (imports[importName] === defaultImports[importName]) { delete imports[importName] }
      }

      if (!Object.keys(imports).length) { delete files[importMapFile] }
      else { files[importMapFile] = JSON.stringify({ imports }, null, 2) }
    }

    return `#${utoa(JSON.stringify({ files, transformer: this?.transformer?.name || 'vue' }))}`
  }

  getFiles() {
    const exported: Record<string, string> = {}
    for (const filename in this.state.files) {
      const normalized
        = filename === importMapFile ? filename : stripSrcPrefix(filename)
      exported[normalized] = this.state.files[filename].code
    }
    return exported
  }

  async setFiles(
    newFiles: Record<string, string>,
    mainFile,
  ) {
    const files: Record<string, File> = {}

    if (mainFile === this.transformer.defaultMainFile && !newFiles[mainFile]) { setFile(files, mainFile, this.transformer.welcomeCode) }

    for (const filename in newFiles) { setFile(files, filename, newFiles[filename]) }

    this.state.errors = []

    for (const file in files) { this.state.errors.push(...(await this.transformer.compileFile(files[file]))) }

    this.state.mainFile = mainFile
    this.state.files = files
    this.initImportMap()
    this.setActive(mainFile)
    this.forceSandboxReset()
  }

  forceSandboxReset() {
    this.resetFlip.value = this.resetFlip.value + 1
  }

  initImportMap(reset: boolean = false) {
    const map = this.state.files[importMapFile]

    if (!map || reset) {
      this.state.files[importMapFile] = new File(
        importMapFile,
        JSON.stringify(
          {
            imports: {
              ...this.transformer.getDefaultImports(),
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
          ...this.transformer.getDefaultImports(),
          ...json.imports,
        }

        map.code = JSON.stringify(json, null, 2)
      }
      catch (e) {
        //
      }
    }
  }

  getImportMap() {
    try {
      return JSON.parse(this.state.files[importMapFile].code)
    }
    catch (e) {
      this.state.errors = [
        `Syntax error in import-map.json: ${(e as Error).message}`,
      ]
      return {}
    }
  }

  setImportMap(map: {
    imports: Record<string, string>
    scopes?: Record<string, Record<string, string>>
  }) {
    this.state.files[importMapFile]!.code = JSON.stringify(map, null, 2)
  }

  setTypeScriptVersion(version: string) {
    this.state.typescriptVersion = version
    console.info(`[@pinceau/repl] Now using TypeScript version: ${version}`)
  }
}

function setFile(
  files: Record<string, File>,
  filename: string,
  content: string,
) {
  // prefix user files with src/
  // for cleaner Volar path completion when using Monaco editor
  const normalized
    = filename !== importMapFile
      && filename !== tsconfigFile
      && !filename.startsWith('src/')
      ? `src/${filename}`
      : filename

  files[normalized] = new File(normalized, content)
}

export function stripSrcPrefix(file: string) {
  return file.replace(/^src\//, '')
}
