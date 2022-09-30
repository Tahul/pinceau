<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Hmr from './Hmr.vue'
import Syntax from './Syntax.vue'
import CssModules from './CssModules.vue'
import Assets from './Assets.vue'
import Slotted from './Slotted.vue'
import ScanDep from './ScanDep.vue'
import AsyncComponent from './AsyncComponent.vue'
import ReactivityTransform from './ReactivityTransform.vue'
import SetupImportTemplate from './SetupImportTemplate.vue'

const time = ref('loading...')

onMounted(
  () => window.addEventListener('load', () => {
    setTimeout(() => {
      const [entry] = performance.getEntriesByType('navigation')
      time.value = `loaded in ${entry.duration.toFixed(2)}ms.`
    }, 0)
  }),
)
</script>

<template>
  <div class="comments">
    <!-- hello -->
  </div>
  <h1>Vue SFCs</h1>
  <pre>{{ time as string }}</pre>
  <div class="hmr-block">
    <Hmr />
  </div>
  <Syntax />
  <CssModules />
  <Assets />
  <Slotted>
    <div class="slotted">
      this should be red
    </div>
  </Slotted>
  <ScanDep />
  <Suspense>
    <AsyncComponent />
  </Suspense>
  <ReactivityTransform :foo="time" />
  <SetupImportTemplate />
</template>
