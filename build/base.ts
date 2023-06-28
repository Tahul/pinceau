import { resolve } from 'node:path'
import { build } from 'unbuild'
import baseBuildConfig from './base.config'

const root = resolve(__dirname, '..')

const buildTargets = async () => await build(root, false, baseBuildConfig)

buildTargets().then(() => console.log('Build completed.'))
