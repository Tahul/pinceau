import { useState } from 'preact/compat'

export function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <header>
          <h1>Hello Vite + Preact!</h1>
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
            <a
              href="https://preactjs.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn Preact
            </a>
          </p>
        </header>
      </div>
    </>
  )
}
