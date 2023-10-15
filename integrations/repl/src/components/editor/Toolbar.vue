<script setup lang="ts">
import type { Ref } from 'vue'
import { inject } from 'vue'
import type { Store } from '../..'
import { importMapFile, themeFile, tsconfigFile } from '../../store'
import VscodeIconsFileTypeTsconfig from '~icons/vscode-icons/file-type-tsconfig'
import VscodeIconsFolderTypeTheme from '~icons/vscode-icons/folder-type-theme'
import VscodeIconsFolderTypePackage from '~icons/vscode-icons/folder-type-package'
import VscodeIconsFileTypeLightConfig from '~icons/vscode-icons/file-type-light-config'

defineEmits(['toggleSettings'])

const store = inject<Store>('store')!
const showTsConfig = inject<Ref<boolean>>('tsconfig')
const showImportMap = inject<Ref<boolean>>('import-map')
const showTheme = inject<Ref<boolean>>('theme')
</script>

<template>
  <div>
    <span
      v-if="showTsConfig"
      :class="{ active: store.state.activeFile.filename === tsconfigFile }"
      @click="store.setActive(tsconfigFile)"
    >
      <VscodeIconsFileTypeTsconfig />
      TSConfig
    </span>
    <span
      v-if="showTheme"
      :class="{ active: store.state.activeFile.filename === themeFile }"
      @click="store.setActive(themeFile)"
    >
      <VscodeIconsFolderTypeTheme />
      Theme
    </span>
    <span
      v-if="showImportMap"
      :class="{ active: store.state.activeFile.filename === importMapFile }"
      @click="store.setActive(importMapFile)"
    >
      <VscodeIconsFolderTypePackage />
      Imports
    </span>
    <span
      @click="$emit('toggleSettings')"
    >
      <VscodeIconsFileTypeLightConfig />
      Settings
    </span>
  </div>
</template>

<style scoped lang="ts">
styled({
  boxSizing: 'border-box',
  borderTop: '1px solid var(--border)',
  borderBottom: '1px solid var(--border)',
  height: 'var(--header-height)',
  zIndex: '999',
  width: '100%',
  backgroundColor: 'var(--bg)',
  display: 'flex',
  alignItems: 'center',
  gap: '$space.4',
  padding: '0 $space.4',
  justifyContent: 'space-evenly',
  span: {
    'padding': '1rem',
    'display': 'flex',
    'alignItems': 'center',
    'justifyContent': 'center',
    'flexDirection': 'column',
    'cursor': 'pointer',
    'fontWeight': '$fontWeight.bold',
    'color': 'var(--text-light)',
    'transition': 'box-shadow 0.05s ease-in-out',
    'svg': {
      fontSize: '$fontSize.lg',
    },
    '&.active': {
      color: 'var(--color-branding)',
      boxShadow: 'inset 0 0 11px $color.red.9',
    },
  },
})
</style>
