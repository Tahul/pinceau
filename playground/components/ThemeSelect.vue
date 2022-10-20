<script setup lang="ts">
import { computed, ref } from 'vue'

const toggleCount = ref(0)
const preference = computed(() => {
  const test = toggleCount.value

  if (!document) {
    return 'dark'
  }

  const cl = document.querySelector('html').classList

  if (cl.contains('light')) {
    return 'light'
  }

  return 'dark'
})

const toggle = () => {
  toggleCount.value++
  const cl = document.querySelector('html').classList
  if (cl.contains('dark')) {
    cl.remove('dark')
    cl.add('light')
    return
  }
  if (cl.contains('light')) {
    cl.remove('light')
    cl.add('dark')
  }
}
</script>

<template>
  <button aria-label="Select color scheme" @click="toggle">
    <span v-if="preference === 'dark'">🌚</span>
    <span v-else-if="preference === 'light'">☀️</span>
  </button>
</template>
