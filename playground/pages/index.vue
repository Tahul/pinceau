<script setup lang="ts">
import { usePinceauTheme } from 'pinceau/runtime'
import JSConfetti from 'js-confetti'
import { onMounted, ref, watch } from 'vue'

const theme = usePinceauTheme()

const colors = ['yellow', 'green', 'red', 'blue']
const myVariants = [
  {
    initial: 'sm',
    md: 'lg',
    xl: 'sm',
  },
  {
    initial: 'sm',
    lg: 'md',
    xl: 'xl',
  },
  {
    initial: 'xl',
    lg: 'lg',
    xl: 'sm',
  },
  {
    initial: 'md',
    lg: 'xl',
    xl: 'lg',
  },
]
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
    emojis: ['🖖', '🖌️', '🥰', '🇳🇱'],
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
      <BigButton :color="rand(colors)" :padded="rand(myVariants)" @click="confettis" />
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
