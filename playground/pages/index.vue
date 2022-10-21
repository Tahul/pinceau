<template>
  <section>
    <PlaygroundGrid>
      <Block
        bordered
        palette="blue"
      >
        Hello World
      </Block>
    </PlaygroundGrid>
  </section>
</template>

<style scoped lang="ts">
css({
  button: {
    padding: '1rem',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  }
})
</style>
