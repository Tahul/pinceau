<script setup lang="ts">
import JSConfetti from 'js-confetti'
import { onMounted, ref } from 'vue'

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
</script>

<template>
  <section>
    <canvas ref="canvas" />
    <PlaygroundGrid>
      <BigButton :padded="{ initial: 'sm', lg: 'lg', xl: 'xl' }" :color="rand(colors)" @click="confettis()" />
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
    overflow: 'hidden',
    position: 'relative',
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100vh',
    width: '100vw',
    zIndex: '-10'
  },
})
</style>
