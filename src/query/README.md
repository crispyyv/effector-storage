# Query string adapter

Adapter to persist [_store_] in [location.search](https://developer.mozilla.org/en-US/docs/Web/API/Location/search)'s query string.

## Usage

To use this adapter, import `persist` function from `'effector-storage/query'` module:

```javascript
import { persist } from 'effector-storage/query'

// persist store `$id` in query string with param name 'id'
persist({ store: $id, key: 'id' })

// if your storage has a name, you can omit `key` field
persist({ store: $id })
```

Two (or more) different stores, persisted with the same key, will be synchronized, even if not connected with each other directly — each store will receive updates from another one.

## URL change method

There are few ways to change URL query string in modern world, you can use one of these four:

- `pushState` — uses [history.pushState](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) call, it doesn't reload page, and adds new history item.
- `replaceState` — uses [history.replaceState](https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState) call, it doesn't reload page, and _doesn't_ add new history item.
- `locationAssign` — uses [location.assign](https://developer.mozilla.org/en-US/docs/Web/API/Location/assign) call, it will reload page, and adds new history item.
- `locationReplace` — uses [location.replace](https://developer.mozilla.org/en-US/docs/Web/API/Location/replace) call, it will reload page, and _doesn't_ add new history item.

By default, `pushState` method is used, but you can change it using `method` option:

```javascript
import { persist, replaceState } from 'effector-storage/query'

// use `history.replaceState` to change query string
persist({ store: $id, key: 'id', method: replaceState })
```

⚠️ **Known issue**<br>
Several states, persisted in the query string, causes several history updates, even if updates were happen (almost) simultaneously.<br>
If you have two stores, persisted in query string, and they both updates — you will have two history records (when using default `pushState` method). Thus if you want to go back using "⬅️Back" button — you will have to click it twice, to revert both stores in the original state.<br>
Sometimes it can lead to nasty cyclic updates, if two stores are dependant from each other. So, be warned.<br>
PR is appreciated :)

## Functional helper

⚠️ Due to deprecation of `.thru` method in [effector version 22](https://github.com/effector/effector/releases/tag/effector%4022.0.0), functional helpers become obsolete, so, they are deprecated as well.<s>

There is special `persist` forms to use with functional programming style. You can use it, if you like, with Domain hook or `.thru()` store method.

To use it, import `persist` function from `'effector-storage/query/fp'` module:

```javascript
import { createDomain } from 'effector'
import { persist } from 'effector-storage/query/fp'

const query = createDomain('query')

// this hook will persist every store, created in domain,
// in query string, using stores' names as param names
query.onCreateStore(persist())

const $id = query.createStore('0', { name: 'id' })

// or persist single store in query string via .thru
const $id = createStore('0')
  .on(setId, (id) => `${id}`)
  .thru(persist({ key: 'id' }))
```

</s>

## Formulae

```javascript
import { persist } from 'effector-storage/query'
```

- `persist({ store, ...options }): Subscription`
- `persist({ source, target, ...options }): Subscription`<s>

```javascript
import { persist } from 'effector-storage/query/fp'
```

- `persist({ ...options }?): (store: Store) => Store`
  </s>

### Options

- ... all the [common options](../../README.md#options) from `persist` function.
- `method`?: ([_function_]): One of `pushState`, `replaceState`, `locationAssign` or `locationReplace`. Default = `pushState`.
- `state`?: (`'keep'` | `'erase'`): If `method` is `pushState` or `replaceState` — should current state be preserved or replaced with `null`. Default = `keep`
- `def`?: (_any_): Default value, which will be passed to `store`/`target` in case of absent query parameter. Default = `store.defaultState` or `null`

## FAQ

### How do I use custom serialization / deserialization?

You don't. Use this adapter only with plain string stores `Store<string | null>`.

If you need some sort of serialization — you can use `.map` method for that. For deserialization you have to use some snippets with `sample`, for example:

```javascript
import { persist } from 'effector-storage/query'

const $entity = createStore(null).on(
  fetchEntityFx.doneData,
  (_, entity) => entity
)

// ~ serialization down to plain `id`
const $id = $entity.map((entity) => `${entity.id}`)
persist({ store: $id, key: 'id' })

// in case of query string change -> fetch new entity by new id
sample({
  source: $id,
  target: fetchEntityFx,
})
```

[_store_]: https://effector.dev/docs/api/effector/store
[_function_]: https://developer.mozilla.org/en-US/docs/Glossary/Function
