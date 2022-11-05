<script setup lang="ts">
// import { ref } from 'vue'

const getRandom = array => array[Math.floor(Math.random() * array.length)]

/*
const getRandomText = () => getRandom(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'])

const randomText = ref(getRandomText())

setInterval(
  () => (randomText.value = getRandomText()),
  100,
)
*/

const getRandomShadow = () => {
  getRandom([
    'light',
    'medium',
    'giant',
    {
      md: 'light',
    },
    {
      md: 'light',
      lg: 'medium',
    },
    {
      xl: 'giant',
    },
  ])
}

const getRandomBorder = () => {
  return getRandom([
    true,
    {
      md: true,
    },
    {
      lg: true,
    },
    {
      xl: true,
    },
  ])
}

const getRandomPalette = () => {
  return getRandom([
    'primary',
    'blue',
    'yellow',
    'red',
    'gray',
    'green',
    'pink',
  ])
}
</script>

<template>
  <section>
    <PlaygroundGrid>
      <Block
        v-for="test in 100"
        :key="test"
        :shadow="getRandomShadow()"
        :palette="getRandomPalette()"
        :bordered="getRandomBorder()"
      >
        Hello World
      </Block>
    </PlaygroundGrid>
  </section>
</template>

<style scoped lang="ts">
css({
  button: {
    padding: '5rem',
  },
  section: {
    '& > div': {
      display: 'flex',
      gap: '1rem',
      flexDirection: 'column',
      gap: '1rem',
      marginTop: '{space.16}',
      marginBottom: '{space.16}'
    },
  }
})
</style>
