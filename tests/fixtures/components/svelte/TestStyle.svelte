<script lang="ts">
  export const test = 'hello world'

  css({
    '.test-style': {
      fontSize: 32,
    },
  })

  console.log('hello world')
</script>

<template>
  <div class="test-style">css() style component</div>
</template>
