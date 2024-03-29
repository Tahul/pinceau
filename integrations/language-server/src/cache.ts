export default class CacheManager<T> {
  private cache: Map<string, Map<string, T>> = new Map()
  private allCache: Map<string, T> = new Map()

  public get(key: string, filePath?: string) {
    if (filePath) { return this.cache.get(filePath)?.get(key) }

    return this.allCache?.get(key)
  }

  public getAll() {
    return this.allCache
  }

  public set(path: string, key: string, value: T) {
    if (!this.cache.get(path)) { this.cache.set(path, new Map()) }
    this.allCache?.set(key, value)
    this.cache.get(path)!.set(key, value)
  }

  public clearFileCache(path: string) {
    this.cache.get(path)?.forEach((_, key) => {
      this.allCache?.delete(key)
    })
    this.cache.get(path)?.clear()
  }

  public clearAllCache() {
    this.allCache?.clear()
    this.cache.clear()
  }
}
