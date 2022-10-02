import { dirname, resolve } from 'path'
import { promises as fs } from 'fs'
import fg from 'fast-glob'

async function run() {
  const files = await fg('*.js', {
    ignore: ['chunk-*'],
    absolute: true,
    cwd: resolve(dirname(import.meta.url), '../dist'),
  })

  for (const file of files) {
    // fix cjs exports
    let code = await fs.readFile(file, 'utf8')

    code += 'if (module.exports.default) module.exports = module.exports.default;'
    await fs.writeFile(file, code)
  }
}

run()
