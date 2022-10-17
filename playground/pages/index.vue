<script setup>
</script>

<template>
  <section>
    <PlaygroundGrid>
      <Alert :color="{ dark: '{colors.yellow.200}', light: '{colors.yellow.200}' }">
        Hello World
      </Alert>

      <Alert primary :color="{ dark: '{colors.red.100}', light: '{colors.yellow.200}' }">
        Hello World
      </Alert>
    </PlaygroundGrid>
  </section>
</template>

<style scoped lang="ts">
css({
  button: {
    backgroundColor: '{colors.primary.900}',
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
