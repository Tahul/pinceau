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

  $: test = 0

  $: TestComponent = $styled.a({ 
    color: (props) => props.color,
    padding: (props) => `${props.size}px`
  })

  const onClick = () => {
    test += 1
    console.log(test)
  }
</script>


<div>
<main on:click={onClick} class={main}>Hello world</main>

<TestComponent color="blue" size={test}>
  hello
</TestComponent>
</div>
