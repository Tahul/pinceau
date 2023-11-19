<script setup lang="ts">
import { computed, inject } from 'vue'
import Toggle from '../Toggle.vue'
import type { Store } from '../..'
import { playgroundConfigFile } from '../../store'
import IconParkOutlineConfig from '~icons/icon-park-outline/config'
import IconParkOutlineBrowser from '~icons/icon-park-outline/browser'

const store = inject('store') as Store

const config = computed({
  get() {
    return store.showConfig.value
  },
  set(v) {
    if (v === true) {
      store.setActive(playgroundConfigFile)
    }
    else if (store?.transformer?.defaultMainFile) {
      store.setActive(store?.transformer?.defaultMainFile)
    }
    store.showConfig.value = v
  },
})
</script>

<template>
  <Toggle
    v-model="config"
    :values="{
      left: {
        value: true,
        tooltip: 'Configuration',
      },
      right: {
        value: false,
        tooltip: 'Playground',
      },
    }"
  >
    <template #left>
      <IconParkOutlineConfig />
    </template>

    <template #right>
      <IconParkOutlineBrowser />
    </template>
  </Toggle>
</template>
