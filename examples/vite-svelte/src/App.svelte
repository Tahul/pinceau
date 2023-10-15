<script lang="ts">
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
        color: '$color.red.1'
      },
    },
  })

  const main = styled({})

  const TestComponent = $styled.a({ color: 'green'}).withVariants({
    size: {
      md: {
        padding: '$space.32'
      },
      options: {
        default: 'md'
      }
    }
  })

  console.log(TestComponent)
</script>


<div>
<main class={main}>Hello world</main>

<TestComponent color="blue">
  hello
</TestComponent>
</div>
