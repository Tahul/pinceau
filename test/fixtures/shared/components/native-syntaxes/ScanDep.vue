<script setup lang="ts">
import { isToken } from 'pinceau/runtime'
</script>

<template>
  <h2>Scan Deps from &lt;script setup lang=ts&gt; blocks</h2>
  <div class="scan">
    {{ typeof isToken === 'function' ? 'ok' : 'error' }}
  </div>
</template>
