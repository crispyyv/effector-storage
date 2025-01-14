import type { StorageAdapter } from '..'

export interface AsyncStorage {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
}

export interface AsyncStorageConfig {
  storage: AsyncStorage
  serialize?: (value: any) => string
  deserialize?: (value: string) => any
}

/**
 * Generic `AsyncStorage` adapter factory
 */
export function asyncStorage({
  storage,
  serialize = JSON.stringify,
  deserialize = JSON.parse,
}: AsyncStorageConfig): StorageAdapter {
  const adapter: StorageAdapter = <State>(key: string) => ({
    async get() {
      const item = await storage.getItem(key)
      return item === null ? undefined : deserialize(item)
    },

    async set(value: State) {
      await storage.setItem(key, serialize(value))
    },
  })

  adapter.keyArea = storage
  return adapter
}
