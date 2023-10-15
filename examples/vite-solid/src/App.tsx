import type { Component } from 'solid-js'
import { createSignal } from 'solid-js'

const App: Component = () => {
  const [count, setCount] = createSignal(0)

  return <div>Hello world: {count}</div>
}

export default App
