<template>
  <main>
    <p>
      {{ color }}
    </p>
    <MyButton />
  </main>
</template>

<script setup lang="ts">
import theme from '$pinceau/theme'

const color = ref('blue')

const colors = Object.keys(theme.color)

const rand = array => array[Math.floor(Math.random() * array.length)];

let interval: NodeJS.Timeout
onMounted(() => {
  if (interval) clearInterval(interval)
  interval = setInterval(
    () => {
      color.value = rand(colors)
    },
    1000
  )
})
</script>

<style lang="ts">
css({
  'html, body, #__nuxt': {
    minHeight: '100vh',
    minWidth: '100vw'
  }
})
</style>

<style scoped lang="ts">
css({
  main: {
    color: '$color.blue.1',
    backgroundColor: '$color.blue.9',
    minHeight: '100vh',
    minWidth: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: '$space.16'
  },
  p: {
    marginBottom: 24
  }
})
</style>
