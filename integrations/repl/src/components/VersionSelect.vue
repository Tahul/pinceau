<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Dropdown from './Dropdown.vue'

const versions = ref<{ value: string; title: string; }[]>()

const version = defineModel<string>()
const props = defineProps<{
  pkg: string
  label: string
}>()

async function fetchVersions(): Promise<string[]> {
  const res = await fetch(`https://data.jsdelivr.com/v1/package/npm/${props.pkg}`)
  const { versions } = (await res.json()) as { versions: string[] }

  if (props.pkg === 'vue') {
    // if the latest version is a pre-release, list all current pre-releases
    // otherwise filter out pre-releases
    let isInPreRelease = versions[0].includes('-')
    const filteredVersions: string[] = []
    for (const v of versions) {
      if (v.includes('-')) {
        if (isInPreRelease) {
          filteredVersions.push(v)
        }
      } else {
        filteredVersions.push(v)
        isInPreRelease = false
      }
      if (filteredVersions.length >= 30 || v === '3.0.10') {
        break
      }
    }
    return filteredVersions
  } else if (props.pkg === 'typescript') {
    return ['latest', ...versions.filter(v => !v.includes('dev') && !v.includes('insiders'))]
  } else if (props.pkg === 'react') {
    return versions.filter(v => !v.includes('experimental') && !v.includes('canary') && !v.includes('next') && !v.includes('beta') && !v.includes('alpha') && !v.includes('0.0.0'))
  } else if (props.pkg === 'pinceau') {
    return ['latest', ...versions]
  }
  return versions
}

onMounted(() => {
  fetchVersions().then((fetchedVersions) => {
    versions.value = fetchedVersions.map((v) => {
      return {
        title: v,
        value: v
      }
    })
  })
})
</script>

<template>
  <div class="version" @click.stop>
    <Dropdown @update:model-value="(v) => $emit('update:modelValue', v)" :model-value="version" :options="versions"  />
  </div>
</template>
