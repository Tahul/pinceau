<template>
  <App class="main">
    <div 
      :styled="{
        width: '100%',
      }"
    >
      <Navigation />
    </div>

    <RouterView />
  </App>
</template>

<script lang="ts" setup>
import App from '../shared/App.vue'
</script>
