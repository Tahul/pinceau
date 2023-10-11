import { useState } from 'react'

const TestComponent = $styled.a({
  color: props => props?.color,
  fontSize: props => props.fontSize,
  variants: {
    size: {
      sm: {
        padding: '1rem',
      },
      options: {
        default: 'sm',
      },
    },
  },
})
  .withProps<{ color: ThemeTokens<'$color'>; fontSize: ThemeTokens<'$fontSize'> }>({
    color: '',
    fontSize: 16,
  })
  .withAttrs({
    // ...attrs
  })

const testSecond = styled({
  color: 'red',
})

css({
  '#root': {
    padding: '$space.16',
  },
})

function App() {
  const [count, setCount] = useState(16)

  return (
    <div>
      <header>
        <TestComponent color="blue" fontSize={count}>
          Hello World {count}
        </TestComponent>
        <br />
        <button onClick={() => setCount(p => p + 1)}>
          Up
        </button>
      </header>
    </div>
  )
}

export default App
