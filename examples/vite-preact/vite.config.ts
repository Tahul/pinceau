import process from 'node:process'
import type { PluginOption } from 'vite'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import prefresh from '@prefresh/vite'

const plugins: (PluginOption | PluginOption[])[] = [
]

if (process.env.USE_REFRESH === 'true')
  plugins.unshift(prefresh())
else
  plugins.push(preact())

// https://vitejs.dev/config/
export default defineConfig({ plugins })
