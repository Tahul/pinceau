<script setup lang="ts">
const logo = ref()

const { apply: applyBrush } = useMotion(logo, {
  initial: {
    scale: 0.1,
    opacity: 0,
    rotate: 45,
  },
  tapped: {
    scale: 1.05,
    opacity: 0.8,
    rotate: -25,
  },
  enter: {
    scale: 1,
    opacity: 1,
    rotate: 0,
  },
})

watch(
  useRoute(),
  // @ts-ignore
  () => applyBrush('tapped').then(() => applyBrush('enter')),
)
</script>

<template>
  <div>
    <div ref="logo" class="logo">
      <img src="/head.svg">
    </div>

    <p>Pinceau</p>
  </div>
</template>

<style scoped lang="ts">
css({
  div: {
    maxHeight: '{docus.header.height}',
    '.logo': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '32px',
      height: '32px',
      img: {
        width: '100%',
        height: '100%'
      }
    },
    display: 'flex',
    alignItems: 'center',
    p: {
      marginLeft: '{space.2}',
      fontFamily: '{typography.font.display}'
    }
  }
})
</style>
