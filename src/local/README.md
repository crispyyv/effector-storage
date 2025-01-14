# `localStorage` adapter

Adapter to persist [_store_] in browser's [localStorage].

## Usage

Import `persist` function from `'effector-storage/local'` module, and it will just work:

```javascript
import { persist } from 'effector-storage/local'

// persist store `$counter` in `localStorage` with key 'counter'
persist({ store: $counter, key: 'counter' })

// if your storage has a name, you can omit `key` field
persist({ store: $counter })
```

Two (or more) different stores, persisted with the same key, will be synchronized, even if not connected with each other directly — each store will receive updates from another one.

Also, by default, stores, persisted in `localStorage`, are automatically synchronized between two (or more) windows/tabs (meaning they are updated on [`'storage'`] event).

## Functional helper

⚠️ Due to deprecation of `.thru` method in [effector version 22](https://github.com/effector/effector/releases/tag/effector%4022.0.0), functional helpers become obsolete, so, they are deprecated as well.<s>

There is special `persist` forms to use with functional programming style. You can use it, if you like, with Domain hook or `.thru()` store method.

To use it, import `persist` function from `'effector-storage/local/fp'` module:

```javascript
import { createDomain } from 'effector'
import { persist } from 'effector-storage/local/fp'

const app = createDomain('app')

// this hook will persist every store, created in domain,
// in `localStorage`, using stores' names as keys
app.onCreateStore(persist())

const $store = app.createStore(0, { name: 'store' })

// or persist single store in `localStorage` via .thru
const $counter = createStore(0)
  .on(increment, (state) => state + 1)
  .on(decrement, (state) => state - 1)
  .thru(persist({ key: 'counter' }))
```

</s>

## Formulae

```javascript
import { persist } from 'effector-storage/local'
```

- `persist({ store, ...options }): Subscription`
- `persist({ source, target, ...options }): Subscription`<s>

```javascript
import { persist } from 'effector-storage/local/fp'
```

- `persist({ ...options }?): (store: Store) => Store`
  </s>

### Options

- ... all the [common options](../../README.md#options) from root `persist` function.
- `sync`? ([_boolean_]): Add [`'storage'`] event listener or no. Default = `true`.
- `serialize`? (_(value: any) => string_): Custom serialize function. Default = `JSON.stringify`.
- `deserialize`? (_(value: string) => any_): Custom deserialize function. Default = `JSON.parse`.

## FAQ

### How do I use custom serialization / deserialization?

Options `serialize` and `deserialize` are got you covered. But make sure, that serialization is stable, meaning, that `deserialize(serialize(object))` is equal to `object` (or `serialize(deserialize(serialize(object))) === serialize(object)`):

```javascript
import { persist } from 'effector-storage/local'

const $date = createStore(new Date(), { name: 'date' })

persist({
  store: $date,
  serialize: (date) => String(date.getTime()),
  deserialize: (timestamp) => new Date(Number(timestamp)),
})
```

### Can I debounce updates, `localStorage` is too slow?

Since version **4.3.0**, you can use `clock` option and `debounce` from [patronum](https://github.com/effector/patronum/tree/main/debounce), to reach that goal:

```javascript
import { debounce } from 'patronum/debounce'
import { persist } from 'effector-storage/local'

// ---8<---
persist({
  store: $store,
  clock: debounce({ source: $store, timeout: 100 }),
})
```

Or you can use `source`/`target` form of `persist` (and also `debounce` from [patronum](https://github.com/effector/patronum/tree/main/debounce)):

```javascript
import { debounce } from 'patronum/debounce'
import { persist } from 'effector-storage/local'

const setWidth = createEvent()
const setWidthDebounced = debounce({
  source: setWidth,
  timeout: 100,
})

const $windowWidth = createStore(window.innerWidth) //
  .on(setWidth, (_, width) => width)

persist({
  source: setWidthDebounced,
  target: $windowWidth,
  key: 'width',
})

// `setWidth` event will be called on every 'resize' event,
// `$windowWidth` store will be updated accordingly
// but `localStorage` will be updated only on debounced event
window.addEventListener('resize', () => {
  setWidth(window.innerWidth)
})
```

[localstorage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
[`'storage'`]: https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent
[_subscription_]: https://effector.dev/docs/glossary#subscription
[_store_]: https://effector.dev/docs/api/effector/store
[_function_]: https://developer.mozilla.org/en-US/docs/Glossary/Function
[_boolean_]: https://developer.mozilla.org/en-US/docs/Glossary/Boolean
