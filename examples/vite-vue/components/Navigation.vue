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

<style scoped lang="ts">
css({
  ul: {
    listStyleType: 'count',
    display: 'flex',
    flexDirection: 'column',
    gap: '$space.2',
  },
  a: {
    textTransform: 'capitalize',
    textDecoration: 'underline',
  }
})
</style>
