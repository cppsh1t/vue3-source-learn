import { expect, test } from 'vitest'
import { reactive, effect } from './5.8.6_values-and-keys'

test('values-test', () => {
    let num = 0
    const map = reactive(
        new Map([
            ['key1', 'value1'],
            ['key2', 'value2'],
        ]),
    )

    effect(() => {
        for (const _ of map.values()) {
            num++
        }
    })
    expect(num).toEqual(2)

    map.set('key3', 'value3')
    expect(num).toEqual(5)
})

test('keys-test', () => {
    let num = 0
    const map = reactive(
        new Map([
            ['key1', 'value1'],
            ['key2', 'value2'],
        ]),
    )

    effect(() => {
        for (const _ of map.keys()) {
            num++
        }
    })
    expect(num).toEqual(2)

    map.set('key2', 'value3')
    expect(num).toEqual(2)
    map.set('key3', 'value3')
    expect(num).toEqual(5)
})
