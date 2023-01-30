<script setup lang="ts">
import { usePinceauTheme } from 'pinceau/runtime'
import JSConfetti from 'js-confetti'
import { onMounted, ref, watch } from 'vue'

const theme = usePinceauTheme()

const colors = ['pink', 'primary', 'red', 'blue']
const rand = (items: any) => items[Math.floor(Math.random() * items.length)]

let confettiInstance: JSConfetti
const canvas = ref()
onMounted(
  () => {
    confettiInstance = new JSConfetti({
      canvas: canvas.value,
    })
  },
)

const confettis = () => {
  confettiInstance.addConfetti({
    emojis: ['⛰', '🏔', '🗻'],
    emojiSize: 128,
    confettiNumber: 10,
  })
}

onMounted(() => {
  watch(theme.theme, theme => console.log({ theme }), { immediate: true })

  // @ts-ignore
  window.pinceauSheet = theme
})
</script>

<template>
  <section>
    <canvas ref="canvas" />
    <PlaygroundGrid>
      <BigButton color="red" @click="confettis" />
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
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100vh',
    width: "100vw ",
    zIndex: '-10'
  },
})
</style>
