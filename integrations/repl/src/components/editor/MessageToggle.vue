<script setup lang="ts">
import { ref } from 'vue'

const visible = ref<boolean>()
</script>

<template>
  <div class="wrapper" @click="visible = !visible">
    <span>Show Error</span>
    <div class="toggle" :class="[{ active: visible }]">
      <div class="indicator" />
    </div>
  </div>
</template>

<style scoped lang="ts">
css({
  '.wrapper': {
    position: 'absolute',
    bottom: '8px',
    right: '15px',
    zIndex: 11,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--bg)',
    color: 'var(--text-light)',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '2px',
    userSelect: 'none',
  },

  '.toggle': {
    display: 'inline-block',
    marginLeft: '4px',
    width: '32px',
    height: '18px',
    borderRadius: '12px',
    position: 'relative',
    backgroundColor: 'var(--border)',
  },

  '.indicator': {
    fontSize: '12px',
    backgroundColor: 'var(--text-light)',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    transition: 'transform ease-in-out 0.2s',
    position: 'absolute',
    left: '2px',
    top: '2px',
    color: 'var(--bg)',
    textAlign: 'center',
  },

  '.active .indicator': {
    backgroundColor: 'var(--color-branding)',
    transform: 'translateX(14px)',
    color: 'white',
  },
})
</style>
