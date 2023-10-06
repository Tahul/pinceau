import React, { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <header>
        <h1>Hello Vite + React!</h1>
        <p>
          <button
            type="button"
            onClick={() => setCount(count => count + 1)}
          >
            count is: {count}
          </button>

          <button
            type="button"
            onClick={() => setCount(count => count + 1)}
          >
            count is: {count}
          </button>

        </p>
        <p>
          Edit <code>App.tsx</code> and save to test HMR updates.
        </p>
        <p>
          <a
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          {' | '}
          <a
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
        </p>
      </header>
    </div>
  )
}

export default App
