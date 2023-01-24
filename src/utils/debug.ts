import { performance } from 'perf_hooks'
import type { PinceauOptions } from 'pinceau'
import { debugMarker, getDebugContext } from '../utils/logger'

export const useDebugPerformance = (text: string, debug: PinceauOptions['debug'], logOnStop = true) => {
  const isDebug = debug === 2

  const performanceTimerStart = performance.now()
  let performanceTimerStop

  return {
    stopPerfTimer: isDebug ? stop : () => { },
    logPerfTimer: isDebug ? debugMarker(text, timing()) : () => { },
  }

  function timing() {
    const { error, success, warning } = getDebugContext()

    let count = Number(parseFloat(`${performanceTimerStop - performanceTimerStart}`).toFixed(2))

    if (isNaN(count)) {
      count = 0
    }

    let color = success

    if (count > 5) { color = warning }
    if (count > 10) { color = error }

    return color(count)
  }

  function stop(silent = false) {
    if (silent) { return }
    performanceTimerStop = performance.now()
    if (logOnStop) { debugMarker(text, timing()) }
  }
}

export function findLineColumn(content, index) {
  const lines = content.split('\n')

  let line
  let column

  lines.forEach((lineContent, lineIndex) => {
    if (lineContent.includes(index)) {
      line = lineIndex
      column = lineContent.indexOf(index) + 1
    }
  })

  return {
    line,
    column,
  }
}
