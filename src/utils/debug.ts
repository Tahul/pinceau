import { performance } from 'perf_hooks'
import chalk from 'chalk'
import type { PinceauOptions } from 'pinceau'
import { debugMarker } from '../utils/logger'

export const useDebugPerformance = (text: string, debug: PinceauOptions['debug'], logOnStop = true) => {
  const isDebug = debug === 2

  const performanceTimerStart = performance.now()
  let performanceTimerStop

  return {
    stopPerfTimer: isDebug ? stop : () => { },
    logPerfTimer: isDebug ? debugMarker(text, timing()) : () => { },
  }

  function timing() {
    let count = Number(parseFloat(`${performanceTimerStop - performanceTimerStart}`).toFixed(2))

    if (isNaN(count)) {
      count = 0
    }

    let color = chalk.greenBright

    if (count > 1) { color = chalk.green }
    if (count > 3) { color = chalk.yellowBright }
    if (count > 5) { color = chalk.yellow }
    if (count > 8) { color = chalk.redBright }
    if (count > 10) { color = chalk.red }
    if (count > 20) { color = chalk.red.underline }

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
