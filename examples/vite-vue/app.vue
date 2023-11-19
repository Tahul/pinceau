<script lang="ts" setup>
import { ref } from 'vue'
import { useMouseInElement } from '@vueuse/core'
import App from '../shared/App.vue'

const containerRef = ref()

const size = ref(128)

css({
  '.container': {
     position: 'relative',
     width: '100%',
     height: '100vh',
     backgroundColor: '$color.gray.8',
     mixBlendMode: 'hard-light'
   },

   '.dot-background': {
     position: 'absolute',
     width: '100%',
     height: '100%',
     backgroundImage: 'radial-gradient(circle, transparent 1px, black 1px)',
     backgroundSize: '10px 10px',
     zIndex: '2'
   },
})

const { x, y } = useMouseInElement(containerRef)

const CircleComponent = $styled.div<{ color: 'red' | 'blue' }>({
  $size: () => `${size.value}px`,
  position: 'absolute',
  left: () => `calc(${x.value}px - calc($size / 2))`,
  top: () => `calc(${y.value}px - calc($size / 2))`,
  width: '$size',
  height: '$size',
  borderRadius: 'calc($size / 2)',
  zIndex: '1',
  boxShadow: '10px 10px 10px red',
  backgroundImage: 'radial-gradient(circle at center, $color.red.5, $color.red.1, $color.red.9)',
})
</script>

<template>
  <App ref="containerRef" class="main container">
    <input :styled="{ position: 'absolute', zIndex: '9', color: '$color.gray.8', borderRadius: '9px', right: 0 }" v-model="size" />
    <CircleComponent color="" />
    <div class="dot-background" />
  </App>
</template>
