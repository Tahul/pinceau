import { basename, resolve } from 'path'
import { promises as fs } from 'fs'
import fg from 'fast-glob'
import chalk from 'chalk'

async function run() {
  const files = await fg('*.js', {
    ignore: ['chunk-*'],
    absolute: true,
    cwd: resolve(__dirname, '../dist'),
  })
  for (const file of files) {
    console.log(chalk.cyan.inverse(' POST '), `Fix ${basename(file)}`)
    // fix cjs exports
    let code = await fs.readFile(file, 'utf8')
    code += 'if (module.exports.default) module.exports = module.exports.default;'
    await fs.writeFile(file, code)
  }
}

run()
