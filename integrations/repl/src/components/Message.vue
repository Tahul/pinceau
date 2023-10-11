<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CompilerError } from 'vue/compiler-sfc'

const props = defineProps(['err', 'warn'])

const dismissed = ref(false)

watch(
  () => [props.err, props.warn],
  () => {
    dismissed.value = false
  },
)

function formatMessage(err: string | Error): string {
  if (typeof err === 'string') {
    return err
  }
  else {
    let msg = err.message
    const loc = (err as CompilerError).loc
    if (loc && loc.start) { msg = `(${loc.start.line}:${loc.start.column}) ${msg}` }

    return msg
  }
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="!dismissed && (err || warn)"
      class="msg"
      :class="err ? 'err' : 'warn'"
    >
      <pre>{{ formatMessage(err || warn) }}</pre>
      <button class="dismiss" @click="dismissed = true">
        ✕
      </button>
    </div>
  </Transition>
</template>

<style lang="ts" scoped>
css({
  '.msg.err': {
    '--color': '#f56c6c',
    '--bg-color': '#fef0f0',
  },
  '.dark .msg.err': {
    '--bg-color': '#2b1d1d',
  },
  '.msg.warn': {
    '--color': '#e6a23c',
    '--bg-color': '#fdf6ec',
  },
  '.dark .msg.warn': {
    '--bg-color': '#292218',
  },
  'pre': {
    margin: '0',
    padding: '12px 20px',
    overflow: 'auto',
  },
  '.msg': {
    position: 'absolute',
    bottom: '0',
    left: '8px',
    right: '8px',
    zIndex: '10',
    border: '2px solid transparent',
    borderRadius: '6px',
    fontFamily: 'var(--font-code)',
    whiteSpace: 'pre-wrap',
    marginBotton: '8px',
    maxHeight: 'calc(100% - 300px)',
    minHeight: '40px',
    display: 'flex',
    alignItems: 'stretch',
    color: 'var(--color)',
    borderColor: 'var(--color)',
    backgroundColor: 'var(--bg-color)',
  },
  '.dismiss': {
    position: 'absolute',
    top: '2px',
    right: '2px',
    width: '18px',
    height: '18px',
    lineHeight: '18px',
    borderRadius: '9px',
    textAlign: 'center',
    display: 'block',
    fontSize: '9px',
    padding: '0',
    color: 'var(--bg-color)',
    backgroundColor: 'var(--color)',
  },
  '@media (max-width: 720px)': {
    '.dismiss': {
      top: '-9px',
      right: '-9px',
    },
    '.msg': {
      bottom: '50px',
    },
  },
  '.fade-enter-active, .fade-leave-active': {
    transition: 'all 0.15s ease-out',
  },
  '.fade-enter-from, .fade-leave-to': {
    opacity: '0',
    transform: 'translate(0, 10px)',
  },
})
</style>
