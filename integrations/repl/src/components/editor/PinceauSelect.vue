<script setup lang="ts">
import { computed, inject } from 'vue'
import type { Store } from '../..'
import VersionSelect from '../VersionSelect.vue'
import PinceauIcon from '../Icon.vue'

const store = inject('store') as Store

const pinceauVersion = computed({
  get() {
    return store.pinceauProvider.targetVersion || store.pinceauProvider.defaultVersion
  },
  set(_) {
    //
  },
})
</script>

<template>
  <div>
    <PinceauIcon />
    <VersionSelect
      v-model="pinceauVersion"
      disabled
      pkg="pinceau"
      label="Pinceau version"
    />
  </div>
</template>
