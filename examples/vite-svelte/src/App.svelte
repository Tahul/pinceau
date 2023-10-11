<script lang="ts">
  export const test: string = 'test'

  css({
    'body,#app': {
      height: '100vh',
      width: '100vw',
    },
    ':root': {
      fontFamily: '$font.sans',
      main: {
        textAlign: 'center',
        padding: '2em',
        margin: '0 auto',
        minHeight: '100%',
      },
    },
  })

  const main = styled({
  })
</script>

<main class={main}>Hello world</main>
