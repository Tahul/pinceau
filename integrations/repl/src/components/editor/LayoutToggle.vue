<script setup lang="ts">
import { computed, inject } from 'vue'
import Toggle from '../Toggle.vue'
import type { Store } from '../..'
import PhSquareSplitVerticalFill from '~icons/ph/square-split-vertical-fill'
import PhSquareSplitHorizontalFill from '~icons/ph/square-split-horizontal-fill'

const store = inject('store') as Store

const layout = computed({
  get() {
    return store.layout.value
  },
  set(v) {
    store.layout.value = v
  },
})
</script>

<template>
  <Toggle
    v-model="layout"
    :values="{
      left: {
        value: 'horizontal',
        tooltip: 'Horizontal',
      },
      right: {
        value: 'vertical',
        tooltip: 'Vertical',
      },
    }"
  >
    <template #left>
      <PhSquareSplitVerticalFill />
    </template>

    <template #right>
      <PhSquareSplitHorizontalFill />
    </template>
  </Toggle>
</template>
