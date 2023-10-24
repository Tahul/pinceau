<script setup lang="ts">
import { Pane, Splitpanes } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { onMounted, provide, ref, toRef } from 'vue'
import type { Store } from '../store'
import { ReplStore } from '../store'
import Output from './output/Output.vue'
import type { EditorComponentType } from './editor/types'
import EditorContainer from './editor/EditorContainer.vue'
import TopBar from './TopBar.vue'

export interface Props {
  theme?: 'dark' | 'light'
  editor: EditorComponentType
  store?: Store
  topBar?: boolean
  compilerOptions?: any
  autoResize?: boolean
  showCompileOutput?: boolean
  showImportMap?: boolean
  showTsConfig?: boolean
  showTheme?: boolean
  clearConsole?: boolean
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
  topBar: true,
  autoResize: true,
  showCompileOutput: true,
  showImportMap: true,
  showTsConfig: true,
  showTheme: true,
  clearConsole: true,
  ssr: false,
  compilerOptions: () => ({}),
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

const initializing = ref(true)
const outputRef = ref<InstanceType<typeof Output>>()
const { store } = props
const compilerOptions = (store.transformer.compilerOptions = props.compilerOptions || {})
if (!compilerOptions.script) { compilerOptions.script = {} }

compilerOptions.script.fs = {
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

onMounted(async () => {
  await store.pinceauProvider.init()

  initializing.value = false
})

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
  <div :key="store.resetFlip.value" class="pinceau-repl-container">
    <TopBar v-if="props.topBar" />
    <Splitpanes class="pinceau-repl" :class="[{ 'has-topbar': props.topBar }]">
      <Pane>
        <EditorContainer v-if="!initializing" :editor-component="editor" />
        <div v-else>
          Loading...
        </div>
      </Pane>
      <Pane>
        <Output
          v-if="!initializing"
          ref="outputRef"
          :editor-component="editor"
          :show-compile-output="props.showCompileOutput"
          :ssr="!!props.ssr"
        />
        <div v-else>
          Loading...
        </div>
      </Pane>
    </Splitpanes>
  </div>
</template>

<style lang="ts" scoped>
css({
  '@import': 'url(\'https://fonts.googleapis.com/css2?family=Onest:wght@400;700;900&display=swap\')',

  '.pinceau-repl-container': {
    '--bg': '$color.white',
    '--bg-soft': '$color.gray.1',
    '--border': '$color.gray.2',
    '--text-light': '$color.gray.9',
    '--font-base': '\'Onest\'',
    '--font-code': '\'JetBrains Mono\', monospace',
    '--color-branding': '$color.red.5',
    '--color-branding-dark': '$color.blue.5',
    '--header-height': '$space.12',

    'fontFamily': 'var(--font-base)',
    'display': 'flex',
    'flexDirection': 'column',
    'height': '100%',
    'color': '$color.gray.9',
  },

  '$dark': {
    '.pinceau-repl-container': {
      '--bg': '$color.gray.9',
      '--bg-soft': '$color.gray.9',
      '--border': '$color.gray.8',
      '--text-light': '$color.gray.1',
      '--color-branding': '$color.red.6',
      '--color-branding-dark': '$color.blue.6',
      'color': '$color.gray.1',
    },
  },

  '.pinceau-repl': {
    'height': '100%',
    'margin': '0',
    'overflow': 'hidden',
    'fontSize': '12px',
    'backgroundColor': 'var(--bg-soft)',
    '&.has-topbar': {
      height: 'calc(100% - var(--header-height))',
    },
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
