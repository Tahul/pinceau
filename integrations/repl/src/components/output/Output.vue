<script setup lang="ts">
import Preview from './Preview.vue'
import { Store } from '../../store'
import { inject, ref, computed } from 'vue'
import type { OutputModes } from './types'
import type { EditorComponentType } from '../editor/types'

const props = defineProps<{
  editorComponent: EditorComponentType
  showCompileOutput?: boolean
  ssr: boolean
}>()

const store = inject('store') as Store
const previewRef = ref<InstanceType<typeof Preview>>()
const modes = computed(() =>
  props.showCompileOutput
    ? (['preview', 'js', 'css', 'ssr'] as const)
    : (['preview'] as const)
)

const mode = ref<OutputModes>(
  (modes.value as readonly string[]).includes(store.initialOutputMode)
    ? (store.initialOutputMode as OutputModes)
    : 'preview'
)

function reload() {
  previewRef.value?.reload()
}

defineExpose({ reload })
</script>

<template>
  <div class="tab-buttons">
    <button
      v-for="m of modes"
      :class="{ active: mode === m }"
      @click="mode = m"
    >
      <span>{{ m }}</span>
    </button>
  </div>

  <div class="output-container">
    <Preview ref="previewRef" :show="mode === 'preview'" :ssr="ssr" />
    <props.editorComponent
      v-if="mode !== 'preview'"
      readonly
      :filename="store.state.activeFile.filename"
      :value="store.state.activeFile.compiled[mode] || ''"
      :mode="mode"
    />
  </div>
</template>

<style scoped lang="ts">
css({
  '.output-container': {
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    // backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .03) 25%, rgba(255, 255, 255, .03) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .03) 75%, rgba(255, 255, 255, .03) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .03) 25%, rgba(255, 255, 255, .03) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .03) 75%, rgba(255, 255, 255, .03) 76%, transparent 77%, transparent)',
    backgroundImage: 'radial-gradient($color.gray.8 1px, transparent 0)',
    backgroundSize: '40px 40px',
    backgroundPosition: '-19px -19px',
    backgroundSize: '50px 50px',
    backgroundPosition: '-38px -38px'
  },
  '.tab-buttons': {
    boxSizing: 'border-box',
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'var(--bg)',
    height: 'var(--header-height)',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'space-evenly',
    'overflowY': 'hidden',
    'overflowX': 'auto',
    '&::-webkit-scrollbar': {
      height: '1px',
    },

    '&::-webkit-scrollbar-track': {
      backgroundColor: 'var(--border)',
    },

    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'var(--color-branding)',
    },

    '&.has-import-map .add': {
      marginRight: '10px',
    },
  },
  '.tab-buttons button': {
    fontFamily: '\'Onest\'',
    flex: '1',
    'display': 'inline-flex',
    'alignItems': 'center',
    justifyContent: 'center',
    'fontSize': '12px',
    'fontFamily': 'var(--font-code)',
    'cursor': 'pointer',
    'color': 'var(--text-light)',
    'boxSizing': 'border-box',
    'padding': '$space.1',
    'transition': 'box-shadow 0.05s ease-in-out',
  },
  '.tab-buttons span': {
    fontSize: '13px',
    fontFamily: 'var(--font-code)',
    textTransform: 'uppercase',
    color: 'var(--text-light)',
    display: 'inline-block',
    padding: '8px 16px 6px',
    lineHeight: '20px'
  },
  'button.active': {
    color: 'var(--color-branding-dark)',
    boxShadow: 'inset 0 0 11px $color.red.9',
  },
})
</style>
