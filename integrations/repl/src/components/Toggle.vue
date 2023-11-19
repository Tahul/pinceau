<script setup lang="ts">
import Popper from 'vue3-popper'

defineProps<{
  modelValue: string | boolean
  values: {
    left: {
      value: string | boolean
      tooltip?: string
    }
    right: {
      value: string | boolean
      tooltip?: string
    }
  }
}>()

defineEmits(['update:modelValue'])
</script>

<template>
  <div>
    <Popper :content="values.left.tooltip" hover>
      <button

        class="left" :class="[{ active: modelValue === values.left.value }]"
        @click="$emit('update:modelValue', values.left.value)"
      >
        <slot name="left" />
      </button>
    </Popper>
    <Popper :content="values.right.tooltip" hover>
      <button
        class="right" :class="[{ active: modelValue === values.right.value }]"
        @click="$emit('update:modelValue', values.right.value)"
      >
        <slot name="right" />
      </button>
    </Popper>
  </div>
</template>

<style lang="ts">
styled({
  position: 'relative',
  backgroundColor: '$color.gray.8',
  padding: '$space.1',
  borderRadius: '$radii.xl',
  button: {
    'display': 'flex',
    'alignItems': 'center',
    'padding': '$space.1',
    'borderRadius': '$radii.xl',
    'fontSize': '16px',
    '&.active': {
      backgroundColor: '$color.gray.9',
      color: '$color.red.4',
    },
  },
})
</style>
