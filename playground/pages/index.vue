<script setup lang="ts">
import { ref } from 'vue'
import { useConfettis } from '../composables/useConfettis'
import DemoButton from '../components/DemoButton.vue'

const canvas = ref()
const { poof } = useConfettis(canvas)
</script>

<template>
  <section>
    <canvas ref="canvas" />
    <PlaygroundGrid>
      <DemoButton />
    </PlaygroundGrid>
  </section>
</template>

<style scoped lang="ts">
css({
  section: {
    overflow: 'hidden',
    padding: '{space.10} {space.8}'
  },
  canvas: {
    userSelect: 'none',
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100vh',
    width: '100vw',
    zIndex: 1
  },
})
</style>
