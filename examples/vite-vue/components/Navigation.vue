<script setup lang="ts">
import { routes } from '../main'
</script>

<template>
  <ul>
    <li v-for="route of routes" :key="route.path">
      <RouterLink :to="route.path">
        {{ route.path.split('/')[1] || 'Home' }}
      </RouterLink>
    </li>
  </ul>
</template>

<style lang="postcss" scoped>
ul {
  list-style-type: circle;
  display: flex;
  flex-direction: column;
  gap: $theme('space.2');
}

a {
  text-transform: capitalize;
  text-decoration: underline;
}
</style>
