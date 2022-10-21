<script setup lang="ts">
import { computed, ref } from 'vue'

const doc = globalThis?.document
const toggleCount = ref(0)
const preference = computed(() => {
  const _ = toggleCount.value
  if (!doc) { return undefined }
  const cl = doc.querySelector('html').classList
  if (cl.contains('light')) { return 'light' }
  return 'dark'
})

const toggle = () => {
  toggleCount.value++
  const cl = document.querySelector('html').classList
  if (cl.contains('dark')) {
    cl.remove('dark')
    cl.add('light')
    localStorage.setItem('nuxt-color-mode', 'light')
    return
  }
  if (cl.contains('light')) {
    cl.remove('light')
    cl.add('dark')
    localStorage.setItem('nuxt-color-mode', 'dark')
  }
}
</script>

<template>
  <button aria-label="Select color scheme" @click="toggle">
    <ClientOnly>
      <span v-if="preference === 'dark'">🌚</span>
      <span v-else-if="preference === 'light'">☀️</span>
    </ClientOnly>
  </button>
</template>
