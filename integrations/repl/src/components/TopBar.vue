<template>
  <div>
    <div>
      <span class="logo">
        <Logo />
        <i>/</i>
        <span>PLAYGROUND</span>
      </span>
    </div>

    <div class="actions">
      <div>
        <PinceauIcon />
        <VersionSelect
          v-model="store.state.typescriptVersion"
          pkg="pinceau"
          label="Pinceau Version"
        />
      </div>
      <span class="separator" />
      <div>
        <SimpleIconsTypescript />
        <VersionSelect
          v-model="store.state.typescriptVersion"
          pkg="typescript"
          label="TypeScript Version"
        />
      </div>
      <span class="separator" />
      <div>
        <component :is="icons[framework]" />
        <VersionSelect
          :model-value="frameworkVersion"
          @update:model-value="(v) => (frameworkVersion = v)"
          :pkg="store.transformer.name"
          :label="`${store.transformer.name} Version`"
        />
        <Dropdown
          v-model="framework"
          :options="[
            { title: 'Vue', value: 'vue' },
            { title: 'Svelte', value: 'svelte' },
            { title: 'React', value: 'react' },
          ]"
        />
      </div>
    </div>
  </div>
</template>


<script lang="ts" setup>
import { inject, computed } from 'vue'
import Logo from './Logo.vue'
import Dropdown from './Dropdown.vue'
import VersionSelect from './VersionSelect.vue'
import PinceauIcon from './Icon.vue'
import SimpleIconsTypescript from '~icons/simple-icons/typescript'
import VscodeIconsFileTypeReactjs from '~icons/vscode-icons/file-type-reactjs'
import VscodeIconsFileTypeVue from '~icons/vscode-icons/file-type-vue'
import VscodeIconsFileTypeSvelte from '~icons/vscode-icons/file-type-svelte'
import { Store } from '..'

const store = inject('store') as Store

const icons = {
  vue: VscodeIconsFileTypeVue,
  react: VscodeIconsFileTypeReactjs,
  svelte: VscodeIconsFileTypeSvelte
}

const framework = computed({
  get() {
    return store.transformer.name || 'vue'
  },
  set(v) {
    store.reset({ transformer: v as 'vue' | 'react' | 'svelte' })
  }
})

const frameworkVersion = computed({
  get() {
    return store.transformer.targetVersion || store.transformer.defaultVersion
  },
  set(v) {
    store.transformer.setVersion(v)
  }
})
</script>

<style scoped lang="ts">
styled({
  padding: '$space.4',
  gap: '$space.1',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  backgroundColor: '$color.gray.9',
  borderBottom: '1px solid $color.gray.8',
  height: 'calc(var(--header-height) * 2)',
  justifyContent: 'space-between',

  $md: {
    flexDirection: 'row',
    height: 'var(--header-height)',
  },

  '.logo': {
    display: 'flex',
    alignItems: 'center',
    gap: '$space.1',
    fontWeight: '$fontWeight.bold',

    i: {
      color: '$color.white',
      padding: '0 $space.1'
    },

    '& > span': {
      color: 'transparent',
      background: 'linear-gradient(127deg, $color.red.4, #FEC8C200), linear-gradient(-127deg, $color.red.2, #FEC8C200)',
      '-webkit-background-clip': 'text',
      '-webkit-text-fill-color': 'transparent'
    }
  },

  '.actions': {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',

    '& > div': {
      display: 'flex',
      alignItems: 'center',
      gap: '$space.2'
    }
  },

  '.separator': {
    width: '2px',
    backgroundColor: '$color.gray.8',
    height: '$space.6',
    display: 'block'
  }
})
</style>
