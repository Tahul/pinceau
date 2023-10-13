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
  <div class="output-container">
    <Preview ref="previewRef" :show="mode === 'preview'" :ssr="ssr" />
    <props.editorComponent
      v-if="mode !== 'preview'"
      readonly
      :filename="store.state.activeFile.filename"
      :value="store.state.activeFile.compiled[mode]"
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
    backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .03) 25%, rgba(255, 255, 255, .03) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .03) 75%, rgba(255, 255, 255, .03) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .03) 25%, rgba(255, 255, 255, .03) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .03) 75%, rgba(255, 255, 255, .03) 76%, transparent 77%, transparent)',
    backgroundSize: '50px 50px',
    backgroundPosition: '-38px -38px'
  },
})
</style>
