<script setup lang="ts">
import { ref } from 'vue'
import { useConfettis } from '../composables/useConfettis'

const canvas = ref()
const { poof } = useConfettis(canvas)
</script>

<template>
  <section>
    <canvas ref="canvas" />
    <PlaygroundGrid>
      <MyButton color="primary" :size="{ initial: 'sm', lg: 'xl' }" @click="poof" />
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
