<script setup>
import { ref } from 'vue'

const sizes = ['light', 'medium', 'giant']

const colors = ['red', 'orange', 'blue']

const size = ref('light')

const css = ref({
  padding: '1px',
  color: 'red',
})

/*
setInterval(
  () => {
    if (size.value === 'light') { size.value = 'medium' }
    else if (size.value === 'medium') { size.value = 'giant' }
    else { size.value = 'light' }

    css.value = {
      padding: `${parseInt(css.value.padding) + 1}px`,
      color: colors[sizes.indexOf(size.value)],
    }
  },
  100)
  */
</script>

<template>
  <section>
    <Block :shadow="size" :css="css" />

    <Block shadow="giant" />

    <Block shadow="giant" />

    <Block shadow="giant" />

    <Block shadow="giant" />

    <Block shadow="giant" />

    <Block shadow="giant" />

    <Block shadow="giant" />

    <Block shadow="giant" />
  </section>
</template>

<style scoped lang="ts">
css({
  button: {
    backgroundColor: '{colors.primary.900}',
    marginTop: '1rem',
    padding: '1rem',
    borderRadius: '1rem'
  },
  section: {
    flex: '1',
    height: '100%',
    width: '100%',
    padding: '1rem 2rem',
    zIndex: '50'
  }
})
</style>
