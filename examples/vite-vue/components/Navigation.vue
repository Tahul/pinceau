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
    width: '100%',
    listStyleType: 'count',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    gap: '$space.2',
    marginBottom: '2rem',
    color: '$borderWidth.lg   test',
  },
  a: {
    textTransform: 'capitalize',
    textDecoration: 'underline',
  },
})
</style>
