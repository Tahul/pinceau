<script setup lang="ts">
const props = defineProps({
  ...$variantsProps('button'),
})
</script>

<template>
  <button :class="{ ...$props }">
    <template v-for="[key, value] in Object.entries($props)">
      <p v-if="value" :key="key">
        {{ value ? key : '' }}
      </p>
    </template>
  </button>
</template>

<style lang="ts" scoped>
css({
  button: {
    boxShadow: '{shadows.2xl}',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '16px',
    width: '320px',
    height: '320px',
    border: '16px solid {colors.grey}',
    padding: '',
    position: 'relative',
    '&:hover': {
      border: '8px solid blue',
    },
    '& > p': {
      fontSize: '16px',
      textDecoration: 'underline',
    },
    variants: {
      primary: {
        backgroundColor: '{colors.primary.500}',
      },
      black: {
        backgroundColor: '{colors.black}',
      },
      lavender: {
        backgroundColor: '{colors.lavender}'
      },
      lila: {
        backgroundColor: '{colors.lila}'
      },
      velvet: {
        backgroundColor: '{colors.velvet}'
      },
      grape: {
        backgroundColor: '{colors.grape}'
      },
      rounded: {
        borderRadius: '50%'
      },
      padded: {
        padding: '4rem'
      },
    }
  }
})
</style>

