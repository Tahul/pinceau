<script setup lang="ts">
import JSConfetti from 'js-confetti'
import { onMounted, ref } from 'vue'

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
</script>

<template>
  <section>
    <canvas ref="canvas" />
    <PlaygroundGrid>
      <BigButton color="yellow" :padded="{ initial: 'sm', lg: 'lg', xl: 'xl' }" @click="confettis()" />
    </PlaygroundGrid>
  </section>
</template>

<style scoped lang="ts">
css({
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  section: {
    '& > div': {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
  },
  canvas: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: '100vw',
    zIndex: '-1'
  }
})
</style>
