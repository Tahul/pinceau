import React from 'react'
import { createRoot } from 'react-dom/client'
import { PinceauProvider } from '$pinceau/react-plugin'
import './index.css'
import App from './App'

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(
  <React.StrictMode>
    <PinceauProvider>
      <App />
    </PinceauProvider>
  </React.StrictMode>,
)