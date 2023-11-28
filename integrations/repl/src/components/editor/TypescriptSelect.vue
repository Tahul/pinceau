<script setup lang="ts">
import { inject } from 'vue'
import type { Store } from '../..'
import VersionSelect from '../VersionSelect.vue'
import SimpleIconsTypescript from '~icons/simple-icons/typescript'

const store = inject('store') as Store
</script>

<template>
  <div>
    <SimpleIconsTypescript />
    <VersionSelect
      v-model="store.state.typescriptVersion"
      pkg="typescript"
      label="TypeScript Version"
    />
  </div>
</template>
