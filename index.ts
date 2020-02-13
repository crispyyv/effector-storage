import effector = require('effector') // tslint:disable-line no-require-imports

// error handler interface
interface ErrorHandler {
  (error: any): void // tslint:disable-line no-any
}

// storage store interface
interface StorageStore<State> extends effector.Store<State> {
  /**
   * Get value from local/session storage,
   * SIC! In rare cases could be different, than value in store
   * (when storage value was changed from another window).
   * This method is used in ./sync to back-update store value
   */
  get<State>(value?: State): State | null

  /**
   * Set error handler
   */
  catch(handler: ErrorHandler): StorageStore<State>
}

/**
 * Wrapper factory for Effector's `createStore` function,
 * creates store and "attaches" it to local/session storage
 *
 * @example
 *   import { createEvent, createStore } from 'effector'
 *   import withStorage from 'effector-storage'
 *
 *   const increment = createEvent('increment')
 *   const decrement = createEvent('decrement')
 *   const resetCounter = createEvent('reset counter')
 *
 *   // ↓ create wrapper, uses localStorage by default
 *   const createStorageStore = withStorage(createStore)
 *
 *   // ↓ or create wrapper, which uses sessionStorage
 *   // const createStorageStore = withStorage(createStore, sessionStorage)
 *
 *   const counter = createStorageStore<number>(0, { key: 'counter' }) // ← use wrapper
 *     .catch(console.error) // ← error handling
 *     .on(increment, state => state + 1)
 *     .on(decrement, state => state - 1)
 *     .reset(resetCounter)
 */
export = function(createStore: typeof effector.createStore, storage?: Storage) {
  storage = storage || localStorage

  // return `createStore` wrapper
  return <State>(
    defaultState: State,
    config: { key: string; name?: string; sid?: string }
  ): StorageStore<State | null> => {
    let errorHandler: ErrorHandler

    // value getter
    function get<State>(value?: State) {
      try {
        const item = storage!.getItem(config.key)
        return item === null
          ? value // item doesn't exist in storage -> return default state
          : JSON.parse(item)
      } catch (err) {
        errorHandler && errorHandler(err)
      }
      return value // in case of error -> return default state
    }

    // value setter
    function set<State>(value: State) {
      try {
        storage!.setItem(config.key, JSON.stringify(value))
      } catch (err) {
        errorHandler && errorHandler(err)
      }
    }

    // create effector store, with rehydrated value
    const store = createStore<State | null>(
      get(defaultState),
      config
    ) as StorageStore<State | null>

    // add getter
    store.get = get

    // add error handler
    store.catch = function(handler: ErrorHandler) {
      errorHandler = handler
      return store
    }

    // watch store changes, and save to storage
    store.watch(set)

    // return modified effector store
    return store
  }
}
