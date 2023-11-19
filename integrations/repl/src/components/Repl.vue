<script setup lang="ts">
import { Pane, Splitpanes } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { onMounted, provide, ref, watch } from 'vue'
import { ReplStore, playgroundConfigFile } from '../store'
import Output from './output/Output.vue'
import Topbar from './Topbar.vue'
import FileSelector from './editor/FileSelector.vue'
import EditorContainer from './editor/EditorContainer.vue'
import ConfigPanel from './ConfigPanel.vue'

export interface Props {
  theme?: 'dark' | 'light'
  clearConsole?: boolean
  ssr?: boolean
  compilerOptions?: any
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

withDefaults(
  defineProps<Props>(),
  {
    theme: 'dark',
    clearConsole: true,
    ssr: true,
    previewOptions: () => ({
      headHTML: '',
      bodyHTML: '',
      placeholderHTML: '',
      customCode: {
        importCode: '',
        useCode: '',
      },
    }),
  },
)

const store = new ReplStore({
  sessionId: ref(location.hash.slice(1)),
})

const outputRef = ref<InstanceType<typeof Output>>()

provide('store', store)

/**
 * Reload the preview iframe
 */
const reload = () => outputRef.value?.reload()

defineExpose({ reload })

const initialized = ref(false)

const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})

watch(
  mounted,
  async () => {
    try {
      if (!initialized.value) {
        initialized.value = true
        await store.init()
      }
    }
    catch (e) {
      console.log({ e })
    }
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <div :key="store.resetFlip.value" class="pinceau-repl-container">
    <Topbar />
    <Splitpanes :horizontal="store.layout.value !== 'vertical'" class="pinceau-repl">
      <Pane id="pinceau-repl-left" class="pane" />
      <Pane id="pinceau-repl-right" class="pane" />
    </Splitpanes>

    <template v-if="mounted">
      <Teleport :to="store.layout.value === 'vertical' ? `#pinceau-repl-left` : `#pinceau-repl-right`">
        <FileSelector />
        <EditorContainer v-if="!store.initializing.value" v-show="!(store.showConfig.value && store.state.activeFile!.filename === playgroundConfigFile)" />
        <ConfigPanel v-show="store.showConfig.value && store.state.activeFile!.filename === playgroundConfigFile" />
      </Teleport>
      <Teleport :to="store.layout.value === 'vertical' ? `#pinceau-repl-right` : `#pinceau-repl-left`">
        <Output ref="outputRef" />
      </Teleport>
    </template>
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
    '--tabs-height': '$space.10',

    'fontFamily': 'var(--font-base)',
    'display': 'flex',
    'flexDirection': 'column',
    'height': '100%',
    'color': '$color.gray.9',

    '--popper-theme-background-color': '$color.gray.1',
    '--popper-theme-background-color-hover': '$color.gray.1',
    '--popper-theme-text-color': '$color.gray.8',
    '--popper-theme-border-width': '1px',
    '--popper-theme-border-style': 'solid',
    '--popper-theme-border-color': '$color.gray.2',
    '--popper-theme-border-radius': '$radii.lg',
    '--popper-theme-padding': '$space.2 $space.4',
    '--popper-theme-box-shadow': '0 6px 30px -6px rgba(0, 0, 0, 0.25)',

    '$dark': {
      '--popper-theme-background-color': '$color.gray.9',
      '--popper-theme-background-color-hover': '$color.gray.9',
      '--popper-theme-text-color': 'white',
      '--popper-theme-border-color': '$color.gray.8',
      '--popper-theme-box-shadow': '0 6px 30px -6px rgba(0, 0, 0, 0.25)',
    },
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
    height: 'calc(100% - var(--header-height))',
    margin: '0',
    overflow: 'hidden',
    fontSize: '12px',
    backgroundColor: 'var(--bg-soft)',
  },

  ':deep(button)': {
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    margin: '0',
    backgroundColor: 'transparent',
  },

  '.pane': {
    position: 'relative',
  },
})
</style>

<style lang="ts">
css({
  '.splitpanes': {
    // background: 'linear-gradient(-45deg, #EE7752, #E73C7E, #23A6D5, #23D5AB)'
  },

  '.popper': {
    fontSize: '$fontSize.xs',
    whiteSpace: 'nowrap',
  },

  '.splitpanes__pane': {
    boxShadow: '0 0 5px rgba(0, 0, 0, .2) inset',
  },

  '.splitpanes--vertical > .splitpanes__splitter': {
    'minWidth': '1px',
    'backgroundColor': 'transparent',

    '&::before': {
      top: 'calc(50% - 60px)',
      left: '-4px',
      width: '8px',
      height: '120px',
    },
  },

  '.splitpanes--horizontal > .splitpanes__splitter': {
    'position': 'relative',
    'minHeight': '1px',
    'backgroundColor': 'transparent',
    'transition': 'color 300ms, opacity 300ms',

    '&::before': {
      top: '-4px',
      left: 'calc(50% - 60px)',
      height: '8px',
      width: '120px',
    },
  },

  '.splitpanes__splitter': {
    'opacity': 0,
    'position': 'relative',
    '&::before': {
      opacity: '0.5',
      content: '\'\'',
      position: 'absolute',
      backgroundColor: '$color.gray.8',
      border: '1px solid $color.gray.7',
      borderRadius: '2px',
      zIndex: '99',
    },
    '&::after': {
      content: '\'\'',
      position: 'absolute',
      top: '0',
      left: '0',
      width: '1px',
      height: '100%',
      backgroundColor: '$color.gray.8',
    },
    '&:hover': {
      '&::before': {
        opacity: '1',
      },
    },
  },
})
</style>
