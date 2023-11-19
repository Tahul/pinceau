<script setup lang="ts">
import { computed, inject } from 'vue'
import VersionSelect from '../VersionSelect.vue'
import type { Store } from '../..'

const store = inject('store') as Store

const frameworkVersion = computed({
  get() {
    return store.transformer.targetVersion || store.transformer.defaultVersion
  },
  set(v) {
    store.transformer.setVersion(v)
  },
})
</script>

<template>
  <VersionSelect
    :model-value="frameworkVersion"
    :pkg="store.transformer.name"
    :label="`${store.transformer.name} Version`"
    @update:model-value="(v) => (frameworkVersion = v)"
  />
</template>
