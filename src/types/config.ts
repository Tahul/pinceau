export interface LoadConfigResult<T> {
  config: T
  sources: string[]
}

export type ConfigLayer = string | {
  cwd?: string
  configFileName?: string
}

export interface ResolvedConfigLayer<T> {
  path: string | undefined
  config: T
}
