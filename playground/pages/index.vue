<script setup>
import { ref } from 'vue'
</script>

<template>
  <section>
    <PlaygroundGrid>
      <Alert size="xl">
        Hello World
      </Alert>

      <Block :css="css" palette="green">
        Hello World
      </Block>
    </PlaygroundGrid>
  </section>
</template>

<style scoped lang="ts">
css({
  button: {
    padding: '1rem',
    borderRadius: '1rem'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  }
})
</style>
