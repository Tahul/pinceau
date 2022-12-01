import chalk from 'chalk'
import type { PinceauOptions } from 'pinceau'
import { logger } from './logger'

export const useDebugPerformance = (text: string, debug: PinceauOptions['debug'], logOnStop = true) => {
  const isDebug = debug === 2

  const performanceTimerStart = performance.now()
  let performanceTimerStop

  return {
    stopPerfTimer: isDebug ? stop : () => {},
    logPerfTimer: isDebug ? log : () => {},
  }

  function timing() {
    const count = Number(parseFloat(`${performanceTimerStop - performanceTimerStart}`).toFixed(2))

    let color = chalk.greenBright

    if (count > 1) { color = chalk.green }
    if (count > 3) { color = chalk.yellowBright }
    if (count > 5) { color = chalk.yellow }
    if (count > 8) { color = chalk.redBright }
    if (count > 10) { color = chalk.red }
    if (count > 20) { color = chalk.red.underline }

    return color(count)
  }

  function log() {
    const debugMarker = chalk.bgBlue.blue(' DEBUG ')
    logger.info(`${debugMarker} ${text} [${timing()}ms]`)
  }

  function stop() {
    performanceTimerStop = performance.now()
    if (logOnStop) { log() }
  }
}
