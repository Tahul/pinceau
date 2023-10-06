<script setup lang="ts">
import { ref } from 'vue'
import MyButton from '../../shared/MyButton.vue'

const props = defineProps<{
  backgroundColor?: string
  color?: string
}>()

const visible = ref(true)

function enter(el, done) {
  setTimeout(
    () => {
      done()
    },
    1000,
  )
}

function leave(el, done) {
  setTimeout(
    () => {
      done()
    },
    1000,
  )
}

const toggle = () => (visible.value = !visible.value)
</script>

<template>
  <div>
    <MyButton v-if="visible" color="green" />

    <MyButton v-if="visible" color="green" size="md" />

    <div :styled="{ marginTop: '$space.8' }">
      <button @click="toggle">
        Toggle
      </button>
    </div>
  </div>
</template>
