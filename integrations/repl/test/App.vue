<script lang="ts" setup>
import { onMounted, ref, shallowRef, watchEffect } from 'vue'
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

const _Editor: any = MonacoEditor

onMounted(() => {
  // @ts-ignore
  window.__replStore__ = store.value
})
</script>

<template>
  <Repl
    :key="framework"
    :store="store"
    :editor="_Editor"
    theme="dark"
    :ssr="true"
  />
</template>

<style lang="ts">
css({
  '.repl-root': {
    height: '100%',
    fontFamily: '$font.mono',
  },
})
</style>
