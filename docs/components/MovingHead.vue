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
  <div ref="logo" style="transform: scale(0.1) rotate3d(45deg); opacity: 0;" class="logo">
    <img src="/head.svg">
  </div>
</template>

<style lang="ts">
css({
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
})
</style>
