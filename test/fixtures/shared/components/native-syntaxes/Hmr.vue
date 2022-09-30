<script setup lang="ts">
import { ref } from 'vue'
import Node from './Node.vue'

const foo = 0

const count = ref(foo)
</script>

<template>
  <h2 class="hmr">
    HMR
  </h2>
  <p>Click the button then edit this message. The count should be preserved.</p>
  <button class="hmr-inc" @click="count++">
    count is {{ count }}
  </button>
</template>

<style>
.hmr-inc {
  color: red;
}
</style>
