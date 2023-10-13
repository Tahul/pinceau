<script setup lang="ts">
import { Pane, Splitpanes } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { provide, ref, toRef } from 'vue'
import type { Store } from '../store'
import { ReplStore } from '../store'
import Output from './output/Output.vue'
import type { EditorComponentType } from './editor/types'
import EditorContainer from './editor/EditorContainer.vue'
import FilesOutputContainer from './output/FilesOutputContainer.vue'

export interface Props {
  theme?: 'dark' | 'light'
  editor: EditorComponentType
  store?: Store
  autoResize?: boolean
  showCompileOutput?: boolean
  showImportMap?: boolean
  showTsConfig?: boolean
  showTheme?: boolean
  clearConsole?: boolean
  transformerOptions?: any
  layout?: 'horizontal' | 'vertical'
  ssr?: boolean
  previewOptions?: {
    headHTML?: string
    bodyHTML?: string
    placeholderHTML?: string
    customCode?: {
      importCode?: string
      useCode?: string
    }
  }
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light',
  store: () => new ReplStore(),
  autoResize: true,
  showCompileOutput: true,
  showImportMap: true,
  showTsConfig: true,
  shoTheme: true,
  clearConsole: true,
  ssr: false,
  previewOptions: () => ({
    headHTML: '',
    bodyHTML: '',
    placeholderHTML: '',
    customCode: {
      importCode: '',
      useCode: '',
    },
  }),
})

if (!props.editor) { throw new Error('The "editor" prop is now required.') }

const outputRef = ref<InstanceType<typeof Output>>()
const { store } = props
const sfcOptions = (store.transformer.options = props.transformerOptions || {})
if (!sfcOptions.script) { sfcOptions.script = {} }

sfcOptions.script.fs = {
  fileExists(file: string) {
    if (file.startsWith('/')) { file = file.slice(1) }
    return !!store.state.files[file]
  },
  readFile(file: string) {
    if (file.startsWith('/')) { file = file.slice(1) }
    return store.state.files[file].code
  },
}

store.init()

provide('store', store)
provide('autoresize', props.autoResize)
provide('import-map', toRef(props, 'showImportMap'))
provide('tsconfig', toRef(props, 'showTsConfig'))
provide('theme', toRef(props, 'showTheme'))
provide('clear-console', toRef(props, 'clearConsole'))
provide('preview-options', props.previewOptions)
provide('theme', toRef(props, 'theme'))
/**
 * Reload the preview iframe
 */
function reload() {
  outputRef.value?.reload()
}

defineExpose({ reload })
</script>

<template>
  <div class="pinceau-repl">
    <Splitpanes>
      <Pane>
        <Splitpanes horizontal>
          <Pane>
            <EditorContainer :editor-component="editor" />
          </Pane>
          <Pane size="0">
            <FilesOutputContainer />
          </Pane>
        </Splitpanes>
      </Pane>
      <Pane>
        <Output
          ref="outputRef"
          :editor-component="editor"
          :show-compile-output="props.showCompileOutput"
          :ssr="!!props.ssr"
        />
      </Pane>
    </Splitpanes>
  </div>
</template>

<style lang="ts" scoped>
css({
  '@import': 'url(\'https://fonts.googleapis.com/css2?family=Onest:wght@400;700;900&display=swap\')',

  '.pinceau-repl': {
    '--bg': '$color.white',
    '--bg-soft': '#f8f8f8',
    '--border': '#ddd',
    '--text-light': '#888',
    '--font-code': '\'JetBrains Mono\', monospace',
    '--color-branding': '$color.red.5',
    '--color-branding-dark': '$color.blue.5',
    '--header-height': '$space.12',
    'height': '100%',
    'margin': '0',
    'overflow': 'hidden',
    'fontSize': '12px',
    'fontFamily': '\'Onest\', sans-serif',
    'backgroundColor': 'var(--bg-soft)',
  },

  '.dark .pinceau-repl': {
    '--bg': '$color.black',
    '--bg-soft': '#242424',
    '--border': '#383838',
    '--text-light': '#aaa',
    '--color-branding': '$color.red.6',
    '--color-branding-dark': '$color.blue.6',
  },

  ':deep(button)': {
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    margin: '0',
    backgroundColor: 'transparent',
  },

  '.main-pane': {

  },
})
</style>

<style lang="ts">
css({
  '.splitpanes': {
    // background: 'linear-gradient(-45deg, #EE7752, #E73C7E, #23A6D5, #23D5AB)'
  },

  '.splitpanes__pane': {
    boxShadow: '0 0 5px rgba(0, 0, 0, .2) inset',
  },

  '.splitpanes--vertical > .splitpanes__splitter': {
    'minWidth': '6px',
    'backgroundColor': '$color.red.5',
    'opacity': '0.5',
    'transition': 'color 300ms, opacity 300ms',
    '&:hover': {
      opacity: '1',
    },
  },

  '.splitpanes--horizontal > .splitpanes__splitter': {
    'minHeight': '6px',
    'backgroundColor': '$color.red.5',
    'opacity': '0.5',
    'transition': 'color 300ms, opacity 300ms',
    '&:hover': {
      opacity: '1',
    },
  },
})
</style>
