<script setup lang="ts">
import { inject, ref, watch } from 'vue'
import Message from '../Message.vue'
import { debounce } from '../../utils'
import type { Store } from '../../store'
import FileSelector from './FileSelector.vue'
import type { EditorComponentType } from './types'

const props = defineProps<{
  editorComponent: EditorComponentType
}>()

const SHOW_ERROR_KEY = 'repl_show_error'

const store = inject('store') as Store
const showMessage = ref(getItem())

const onChange = debounce((code: string) => (store.state.activeFile.code = code), 250)

function setItem() {
  localStorage.setItem(SHOW_ERROR_KEY, showMessage.value ? 'true' : 'false')
}

function getItem() {
  const item = localStorage.getItem(SHOW_ERROR_KEY)
  return !(item === 'false')
}

watch(showMessage, () => {
  setItem()
})
</script>

<template>
  <FileSelector />
  <div class="editor-container">
    <props.editorComponent
      :value="store.state.activeFile.code || ''"
      :filename="store.state.activeFile.filename"
      @change="onChange"
    />
    <Message v-show="showMessage" :err="store.state.errors[0]" />
  </div>
</template>

<style lang="ts" scoped>
css({
  '.editor-container': {
    height: 'calc(100% - calc(var(--header-height)))',
    overflow: 'hidden',
    position: 'relative',
  },
})
</style>
