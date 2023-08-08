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
a {
  text-transform: capitalize;
}
</style>
