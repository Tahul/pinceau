import { exec } from 'node:child_process'

export async function run() {
  return new Promise((resolve, reject) => {
    exec('vitest --run -t completion.test.ts', (error, stdout) => {
      if (error) {
        reject(error)
        return
      }

      resolve(stdout)
    })
  })
}
