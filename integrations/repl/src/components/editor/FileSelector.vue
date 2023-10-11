<script setup lang="ts">
import type { Ref, VNode } from 'vue'
import { computed, inject, ref } from 'vue'
import type { Store } from '../../store'
import { importMapFile, stripSrcPrefix, tsconfigFile } from '../../store'

const store = inject('store') as Store

/**
 * When `true`: indicates adding a new file
 * When `string`: indicates renaming a file, and holds the old filename in case
 * of cancel.
 */
const pending = ref<boolean | string>(false)
/**
 * Text shown in the input box when editing a file's name
 * This is a display name so it should always strip off the `src/` prefix.
 */
const pendingFilename = ref(`Comp.${store.transformer.name}`)
const showTsConfig = inject<Ref<boolean>>('tsconfig')
const showImportMap = inject<Ref<boolean>>('import-map')
const files = computed(() => Object.entries(store.state.files)
  .filter(
    ([name, file]) => {
      return name !== importMapFile && name !== tsconfigFile && !file.hidden
    },
  )
  .map(([name]) => name),
)

function startAddFile() {
  let i = 0
  let name = 'Comp.vue'

  while (true) {
    let hasConflict = false
    for (const filename in store.state.files) {
      if (stripSrcPrefix(filename) === name) {
        hasConflict = true
        name = `Comp${++i}.vue`
        break
      }
    }
    if (!hasConflict) { break }
  }

  pendingFilename.value = name
  pending.value = true
}

function cancelNameFile() {
  pending.value = false
}

function focus({ el }: VNode) {
  ;(el as HTMLInputElement).focus()
}

function doneNameFile() {
  if (!pending.value) { return }
  // add back the src prefix
  const filename = `src/${pendingFilename.value}`
  const oldFilename = pending.value === true ? '' : pending.value

  if (!/\.(vue|js|ts|css|json|jsx|tsx|svelte)$/.test(filename)) {
    store.state.errors = [
      'Playground only supports *.vue, *.js, *.ts, *.css, *.json files.',
    ]
    return
  }

  if (filename !== oldFilename && filename in store.state.files) {
    store.state.errors = [`File "${filename}" already exists.`]
    return
  }

  store.state.errors = []
  cancelNameFile()

  if (filename === oldFilename) { return }

  if (oldFilename) { store.renameFile(oldFilename, filename) }
  else { store.addFile(filename) }
}

function editFileName(file: string) {
  pendingFilename.value = stripSrcPrefix(file)
  pending.value = file
}

const fileSel = ref(null)
function horizontalScroll(e: WheelEvent) {
  e.preventDefault()
  const el = fileSel.value! as HTMLElement
  const direction
    = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY
  const distance = 30 * (direction > 0 ? 1 : -1)
  el.scrollTo({
    left: el.scrollLeft + distance,
  })
}
</script>

<template>
  <div
    ref="fileSel"
    class="file-selector"
    :class="{ 'has-import-map': showImportMap }"
    @wheel="horizontalScroll"
  >
    <template v-for="(file, i) in files">
      <div
        v-if="pending !== file"
        :key="file"
        class="file"
        :class="{ active: store.state.activeFile.filename === file }"
        @click="store.setActive(file)"
        @dblclick="i > 0 && editFileName(file)"
      >
        <span class="label">{{ stripSrcPrefix(file) }}</span>
        <span v-if="i > 0" class="remove" @click.stop="store.deleteFile(file)">
          <svg class="icon" width="12" height="12" viewBox="0 0 24 24">
            <line stroke="#999" x1="18" y1="6" x2="6" y2="18" />
            <line stroke="#999" x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </span>
      </div>
      <div
        v-if="(pending === true && i === files.length - 1) || pending === file"
        :key="file"
        class="file pending"
      >
        <input
          v-model="pendingFilename"
          spellcheck="false"
          @blur="doneNameFile"
          @keyup.enter="doneNameFile"
          @keyup.esc="cancelNameFile"
          @vue:mounted="focus"
        >
      </div>
    </template>
    <button class="add" @click="startAddFile">
      +
    </button>

    <div class="import-map-wrapper">
      <div
        v-if="showTsConfig"
        class="file"
        :class="{ active: store.state.activeFile.filename === tsconfigFile }"
        @click="store.setActive(tsconfigFile)"
      >
        <span class="label">tsconfig.json</span>
      </div>
      <div
        v-if="showImportMap"
        class="file"
        :class="{ active: store.state.activeFile.filename === importMapFile }"
        @click="store.setActive(importMapFile)"
      >
        <span class="label">Import Map</span>
      </div>
    </div>
  </div>
</template>

<style lang="ts" scoped>
css({
  '.file-selector': {
    'display': 'flex',
    'boxSizing': 'border-box',
    'borderBottom': '1px solid var(--border)',
    'backgroundColor': 'var(--bg)',
    'overflowY': 'hidden',
    'overflowX': 'auto',
    'whiteSpace': 'nowrap',
    'position': 'relative',
    'height': 'var(--header-height)',

    '&::-webkit-scrollbar': {
      height: '1px',
    },

    '&::-webkit-scrollbar-track': {
      backgroundColor: 'var(--border)',
    },

    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'var(--color-branding)',
    },

    '&.has-import-map .add': {
      marginRight: '10px',
    },
  },

  '.file': {
    'display': 'inline-block',
    'fontSize': '13px',
    'fontFamily': 'var(--font-code)',
    'cursor': 'pointer',
    'color': 'var(--text-light)',
    'boxSizing': 'border-box',

    '&.active': {
      color: 'var(--color-branding)',
      borderBottom: '3px solid var(--color-branding)',
      cursor: 'text',
    },

    'span': {
      display: 'inline-block',
      padding: '8px 10px 6px',
      lineHeight: '20px',
    },

    'input': {
      width: '90px',
      height: '30px',
      lineHeight: '30px',
      outline: 'none',
      border: '1px solid var(--border)',
      borderRadius: '4px',
      padding: '0 0 0 10px',
      marginTop: '2px',
      marginLeft: '6px',
      fontFamily: 'var(--font-code)',
      fontSize: '12px',
    },

    '&.remove': {
      display: 'inline-block',
      verticalAlign: 'middle',
      lineHeight: '12px',
      cursor: 'pointer',
      paddingLeft: '0px',
    },
  },

  '.add': {
    fontSize: '18px',
    fontFamily: 'var(--font-code)',
    color: '#999',
    verticalAlign: 'middle',
    marginLeft: '6px',
    position: 'relative',
    top: '-1px',
  },

  '.icon': {
    marginTop: '-1px',
  },

  '.import-map-wrapper': {
    position: 'sticky',
    marginLeft: 'auto',
    top: '0',
    right: '0',
    paddingLeft: '30px',
    backgroundColor: 'var(--bg)',
    background: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 25%)',
  },

  '$dark': {
    '.import-map-wrapper': {
      background: 'linear-gradient(90deg, rgba(26, 26, 26, 0) 0%, rgba(26, 26, 26, 1) 25%)',
    },
  },
})
</style>
