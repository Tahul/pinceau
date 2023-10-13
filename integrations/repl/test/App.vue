<script lang="ts" setup>
import { ref, shallowRef, watchEffect } from 'vue'
import { Repl, ReplStore } from '../src'
import MonacoEditor from '../src/components/editor/MonacoEditor.vue'

const query = new URLSearchParams(location.search)

const framework = ref<'vue' | 'react' | 'svelte'>('vue')

const store = shallowRef(
  new ReplStore({
    transformer: framework.value,
    serializedState: location.hash.slice(1),
    showOutput: query.has('so'),
    outputMode: query.get('om') || 'preview',
  }),
)

watchEffect(() => history.replaceState({}, '', store.value.serialize()))

async function _setFramework(newFramework: 'vue' | 'react' | 'svelte') {
  store.value = await store.value.reset({ transformer: newFramework })
  framework.value = newFramework
}

const _Editor: any = MonacoEditor
</script>

<template>
  <Repl
    :key="framework"
    :store="store"
    :editor="_Editor"
    theme="dark"
    :ssr="false"
  />
</template>

<style lang="ts">
css({
  '.repl-root': {
    height: '100%',
  },
})
</style>
