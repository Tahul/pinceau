<script lang="ts">
const testSecond = 'hello world?'
</script>

<script setup lang="ts">
import { ref } from 'vue';
import MyButton from '../../shared/MyButton.vue'

const props = defineProps<{
  backgroundColor?: string
  color?: string
}>()

const backgroundColor = $theme('color.blue.9')

const visible = ref(true)

const enter = (el, done) => {
  setTimeout(
    () => {
      done()
    },
    1000
  )
}

const leave = (el, done) => {
  setTimeout(
    () => {
      done()
    },
    1000
  )
}

const toggle = () => (visible.value = !visible.value)
</script>

<template>
  <div :style="{ backgroundColor }">
    <MyButton v-if="visible" :size="{ $initial: 'xl', $md: 'sm' }" color="blue" />

    <MyButton v-if="visible" size="sm" color="green" />

    <div :styled="{ marginTop: '$space.8' }">
      <button @click="toggle">Toggle</button>
    </div>
  </div>
</template>
