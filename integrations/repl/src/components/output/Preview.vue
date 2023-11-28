<script setup lang="ts">
import Message from '../Message.vue'
import {
  ref,
  onMounted,
  onUnmounted,
  watch,
  inject,
} from 'vue'
import srcdoc from './srcdoc.html?raw'
import { PreviewProxy } from './PreviewProxy'
import { Store, importMapFile } from '../../store'

const store = inject('store') as Store

defineProps(['show'])

const container = ref()
const runtimeError = store.runtimeError
const runtimeWarning = store.runtimeWarning

// Create first sandbox
onMounted(createSandbox)

// Reset sandbox when import map changes
watch(
  () => store.state.files[importMapFile]?.code,
  () => {
    try {
      createSandbox()
    } catch (e: any) {
      store.state.errors = [e as Error]
      return
    }
  }
)

// Reset sandbox when version changes
watch(store.resetFlip, createSandbox)

// Cleanup proxy if component unmounted
onUnmounted(() => {
  store.previewProxy.value?.destroy()
  store.previewProxy.value = undefined
})

function createSandbox() {
  store.sandboxCreating = new Promise<void>((resolve) => {
    if (store.previewProxy.value) {
      store.previewProxy.value?.destroy()
      store.previewProxy.value = undefined
      container.value.removeChild(store.sandbox.value)
    }

    const sandbox = store.sandbox.value = document.createElement('iframe')

    sandbox.setAttribute(
      'sandbox',
      [
        'allow-forms',
        'allow-modals',
        'allow-pointer-lock',
        'allow-popups',
        'allow-same-origin',
        'allow-scripts',
        'allow-top-navigation-by-user-activation'
      ].join(' ')
    )

    const importMap = store.getImportMap()

    if (!importMap.imports) { importMap.imports = {} }

    let sandboxSrc = srcdoc
      .replace(/<!--IMPORT_MAP-->/, JSON.stringify(importMap))
      .replace(
        /<!-- PREVIEW-OPTIONS-HEAD-HTML -->/,
        store?.previewOptions.value?.headHTML || ''
      )
      .replace(
        /<!--PREVIEW-OPTIONS-PLACEHOLDER-HTML-->/,
        store?.previewOptions.value?.placeholderHTML || ''
      )

    sandboxSrc = sandboxSrc.replace(
      /<!-- PREVIEW-PINCEAU-THEME -->/,
      `<style id="pinceau-theme">${store?.state?.builtFiles?.['@pinceau/outputs/theme.css']?.code || ''}</style>`
    )

    sandbox.srcdoc = sandboxSrc

    container.value.appendChild(sandbox)

    const previewProxy = store.previewProxy.value = new PreviewProxy(
      sandbox,
      {
        on_fetch_progress: (progress: any) => {
          // pending_imports = progress;
        },
        on_error: (event: any) => {
          const msg =
            event.value instanceof Error ? event.value.message : event.value
          if (
            msg.includes('Failed to resolve module specifier') ||
            msg.includes('Error resolving module specifier')
          ) {
            runtimeError.value =
              msg.replace(/\. Relative references must.*$/, '') +
              `.\nTip: edit the "Import Map" tab to specify import paths for dependencies.`
          } else {
            runtimeError.value = event.value
          }
        },
        on_unhandled_rejection: (event: any) => {
          let error = event.value
          if (typeof error === 'string') {
            error = { message: error }
          }
          runtimeError.value = 'Uncaught (in promise): ' + error.message
        },
        on_console: (log: any) => {
          if (log.duplicate) {
            return
          }
          if (log.level === 'error') {
            if (log.args[0] instanceof Error) {
              runtimeError.value = log.args[0].message
            } else {
              runtimeError.value = log.args[0]
            }
          } else if (log.level === 'warn') {
            if (log.args[0].toString().includes('[Vue warn]')) {
              runtimeWarning.value = log.args
                .join('')
                .replace(/\[Vue warn\]:/, '')
                .trim()
            }
          }
        },
        on_console_group: (action: any) => {
          // group_logs(action.label, false);
        },
        on_console_group_end: () => {
          // ungroup_logs();
        },
        on_console_group_collapsed: (action: any) => {
          // group_logs(action.label, true);
        },
      }
    )

    sandbox.addEventListener('load', async () => {
      previewProxy.handle_links()
      store.sandboxCreating = undefined
      await store.transformer?.updatePreview()
      resolve()
    })
  })
}

/**
 * Reload the preview iframe
 */
function reload() { store.sandbox.value!.contentWindow?.location.reload() }

defineExpose({ reload })
</script>

<template>
  <div v-show="show" class="iframe-container" ref="container"></div>
  <Message :err="runtimeError" />
  <Message v-if="!runtimeError" :warn="runtimeWarning" />
</template>

<style lang="ts" scoped>
css({
  '.iframe-container, .iframe-container :deep(iframe)': {
    width: '100%',
    height: '100%',
    border: 'none',
    position: 'relative'
  },
  '.msg': {
    marginBottom: '$space.14'
  }
})
</style>
