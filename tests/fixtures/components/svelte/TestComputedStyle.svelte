<script lang="ts">
  export let fontSize: number = 16

  export const test = 'hello world'

  export let backgroundColor: string = 'white'

  css({
    '.test-computed-style': {
      fontSize: () => fontSize,
      backgroundColor: () => backgroundColor,
    },
  })
</script>

<div
  class="test-computed-style"
  styled={{
    fontSize: () => fontSize + 2,
  }}
>
  Computed Style component
</div>
