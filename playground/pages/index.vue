<script setup>
</script>

<template>
  <section>
    <PlaygroundGrid>
      <Card success>
        Hello World
      </Card>
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
