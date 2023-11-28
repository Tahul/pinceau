<script setup lang="ts">
import Popper from 'vue3-popper'
import { computed, inject } from 'vue'
import type { Store } from '../..'
import Dropdown from '../Dropdown.vue'
import VscodeIconsFileTypeReactjs from '~icons/vscode-icons/file-type-reactjs'
import VscodeIconsFileTypeVue from '~icons/vscode-icons/file-type-vue'
import VscodeIconsFileTypeSvelte from '~icons/vscode-icons/file-type-svelte'

const store = inject('store') as Store

const icons = {
  vue: VscodeIconsFileTypeVue,
  react: VscodeIconsFileTypeReactjs,
  svelte: VscodeIconsFileTypeSvelte,
}

const framework = computed({
  get() {
    return store.transformer?.name || 'vue'
  },
  async set(v) {
    if (v) {
      await store.reset({ transformer: v as any })
    }
  },
})
</script>

<template>
  <Popper content="Playground framework" hover>
    <div class="framework-toggle">
      <component :is="icons[framework]" />
      <Dropdown
        v-model="framework"
        :options="[
          { title: 'Vue', value: 'vue' },
          { title: 'Svelte', value: 'svelte' },
          { title: 'React', value: 'react' },
        ]"
      />
    </div>
  </Popper>
</template>

<style lang="ts">
css({
  '.framework-toggle': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '$space.2',
  },
})
</style>
