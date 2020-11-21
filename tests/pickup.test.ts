import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { snoop } from 'snoop'
import { createStore, createEvent } from 'effector'
import { persist } from '../src'
import { storage } from '../src/storage'
import { createStorageMock } from './mocks/storage.mock'

//
// Tests
//

test('should pickup new value on event', () => {
  const watch = snoop(() => undefined)

  const mockStorage = createStorageMock()
  mockStorage.setItem('$store', '0')

  const adapter = storage({ storage: mockStorage })

  const pickup = createEvent()
  const $store = createStore(1, { name: '$store' })
  $store.watch(watch.fn)

  assert.is($store.getState(), 1)
  assert.is(watch.callCount, 1)
  assert.equal(watch.calls[0].arguments, [1])

  persist({ store: $store, adapter, pickup })

  assert.is($store.getState(), 0)
  assert.is(watch.callCount, 2)
  assert.equal(watch.calls[1].arguments, [0])

  mockStorage.setItem('$store', '42') // <- change store value
  assert.is($store.getState(), 0)
  assert.is(watch.callCount, 2)

  pickup() // <- pick up new value

  assert.is($store.getState(), 42)
  assert.is(watch.callCount, 3)
  assert.equal(watch.calls[2].arguments, [42])
})

//
// Launch tests
//

test.run()
