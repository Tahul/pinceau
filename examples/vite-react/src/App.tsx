import { PinceauTheme } from '$pinceau/theme'
import { useState } from 'react'

const TestComponent = $styled
.a<{
  color?: keyof PinceauTheme['color'];
  fontSize?: keyof PinceauTheme['fontSize'];
}>({
  $primaryColor: ({ color }) => `$color.${color}.1`,
  $secondaryColor: ({ color }) => `$color.${color}.2`,
  color: '$primaryColor'
})
.withVariants({
  size: {
    sm: {
      fontSize: '$fontSize.sm'
    },
    md: {
      fontSize: '$fontSize.base'
    },
    lg: {
      fontSize: '$fontSize.5xl'
    }
  }
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
        <TestComponent color="magenta" size="lg">
          ???
        </TestComponent>

        <button
          onClick={() => setCount(p => p + 1)}
          className={styled({ backgroundColor: '$color.blue.5', padding: () => count })}
        >
          Move it
        </button>
      </header>
    </div>
  )
}

export default App
