<script lang="ts" setup>
import App from '../shared/App.vue'
</script>

<script lang="ts">
const TestComponent = $styled.a<{ color: keyof PinceauTheme['color'] }>({
  color: ({ color = 'red' }) => `$color.${color}.5`,
  backgroundColor: 'green'
}).withVariants({
  size: {
    md: {
      padding: '$space.32'
    },
    options: {
      default: 'md'
    }
  }
})
</script>

<template>
  <App class="main">
    <div>
      <Navigation />
    </div>

    <TestComponent>
      hello world
    </TestComponent>

    <TestComponent size="md" color="blue">
      hello world
    </TestComponent>

    <RouterView />
  </App>
</template>
