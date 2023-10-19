<script setup lang="ts">
const TestComponent = $styled.a({
  
})
</script>

<template>
  <App 
    :styled="{
      backgroundColor: '$color.blue.1'
    }"
  >
    <NuxtPage />
  </App>
</template>
