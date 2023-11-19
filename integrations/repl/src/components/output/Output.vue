<script setup lang="ts">
import Preview from './Preview.vue'
import { Store } from '../../store'
import { inject, ref, computed } from 'vue'
import type { OutputModes } from './types'
import Tabs from '../Tabs.vue'
import MonacoEditor from '../editor/MonacoEditor.vue'

const $emit = defineEmits(['created'])

const store = inject('store') as Store
const previewRef = ref<InstanceType<typeof Preview>>()
const modes = computed(() => ['preview', 'js', 'css', 'ssr'])

const mode = ref<OutputModes>('preview')

function reload() {
  previewRef.value?.reload()
}

defineExpose({ reload })
</script>

<template>
  <Tabs v-model="mode" :tabs="[...modes.map(value => ({ value, label: value }))]" />

  <div class="output-container">
    <Preview 
      :show="mode === 'preview'"
      ref="previewRef"
    />
    <MonacoEditor
      v-if="mode !== 'preview'"
      readonly
      :filename="store.state.activeFile?.filename || ''"
      :value="store.state.activeFile?.compiled?.[mode] || ''"
      :mode="mode"
    />
  </div>
</template>

<style scoped lang="ts">
css({
  '.output-container': {
    height: 'calc(100% - var(--tabs-height))',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    backgroundImage: 'radial-gradient($color.gray.8 1px, transparent 0)',
    backgroundSize: '40px 40px',
    backgroundPosition: '-19px -19px'
  }
})
</style>
