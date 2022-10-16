<script setup>
</script>

<template>
  <div>
    <slot />
  </div>
</template>

<style lang="ts" scoped>
css({
  div: {
    width: '100%',
    height: '100%',
    border: '1px solid {colors.gray.900}',
    borderRadius: '{radii.xl}',
    maskImage: 'linear-gradient(0deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,.5))',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(51 65 85 / 0.25)'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E")`,
    boxShadow: '{shadows.sm}',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
</style>
