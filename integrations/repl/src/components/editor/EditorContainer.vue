<script setup lang="ts">
import { inject, ref, watch } from 'vue'
import Message from '../Message.vue'
import { debounce } from '../../utils'
import type { Store } from '../../store'
import MonacoEditor from './MonacoEditor.vue'

const SHOW_ERROR_KEY = 'repl_show_error'

const store = inject('store') as Store
const showMessage = ref(getItem())

const onChange = debounce(
  (code: string) => {
    if (store.state.activeFile) { store.state.activeFile.code = code }
    console.log('setting code!')
  },
  300,
)

function setItem() {
  localStorage.setItem(SHOW_ERROR_KEY, showMessage.value ? 'true' : 'false')
}

function getItem() {
  const item = localStorage.getItem(SHOW_ERROR_KEY)
  return !(item === 'false')
}

watch(showMessage, () => setItem())
</script>

<template>
  <div>
    <MonacoEditor
      :value="store.state.activeFile?.code || ''"
      :filename="store.state.activeFile?.filename || ''"
      @change="onChange"
    />
    <Message v-show="showMessage" :err="store.state.errors[0]" />
  </div>
</template>

<style lang="ts" scoped>
styled({
  height: 'calc(100% - var(--tabs-height))',
  overflow: 'hidden',
  position: 'relative',
})
</style>
