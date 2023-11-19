<script setup lang="ts">
interface DropdownOption {
  value: string
  title: string
}

withDefaults(
  defineProps<{
    options: DropdownOption[]
    modelValue: string | undefined
  }>(),
  {
    options: () => ([]),
  },
)

const emit = defineEmits(['update:modelValue'])

function onChange(e: Event): void {
  const target = e.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div>
    <select :value="modelValue" @change="onChange">
      <option v-for="option of options" :key="option.value" :value="option.value">
        {{ option.title }}
      </option>
    </select>
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none">
      <path d="M14.6666 7.64174C14.5104 7.48653 14.2992 7.39941 14.0791 7.39941C13.8589 7.39941 13.6477 7.48653 13.4916 7.64174L10.4999 10.5917L7.54992 7.64174C7.39378 7.48653 7.18257 7.39941 6.96242 7.39941C6.74226 7.39941 6.53105 7.48653 6.37492 7.64174C6.29681 7.71921 6.23481 7.81138 6.19251 7.91293C6.1502 8.01448 6.12842 8.1234 6.12842 8.23341C6.12842 8.34342 6.1502 8.45234 6.19251 8.55389C6.23481 8.65544 6.29681 8.74761 6.37492 8.82507L9.90825 12.3584C9.98572 12.4365 10.0779 12.4985 10.1794 12.5408C10.281 12.5831 10.3899 12.6049 10.4999 12.6049C10.6099 12.6049 10.7188 12.5831 10.8204 12.5408C10.9219 12.4985 11.0141 12.4365 11.0916 12.3584L14.6666 8.82507C14.7447 8.74761 14.8067 8.65544 14.849 8.55389C14.8913 8.45234 14.9131 8.34342 14.9131 8.23341C14.9131 8.1234 14.8913 8.01448 14.849 7.91293C14.8067 7.81138 14.7447 7.71921 14.6666 7.64174Z" fill="#D4D4D4" />
    </svg>
  </div>
</template>

<style lang="ts">
styled({
  position: 'relative',

  select: {
    paddingLeft: '$space.4',
    paddingRight: '$space.8',
    paddingTop: '$space.1',
    paddingBottom: '$space.1',
    backgroundColor: '$color.gray.8',
    borderRadius: '$radii.xl',
    appearance: 'none',
    width: '100px',
    fontWeight: '$fontWeight.bold',
  },

  svg: {
    position: 'absolute',
    right: '$space.1',
    top: '$space.2',
  },
})
</style>
