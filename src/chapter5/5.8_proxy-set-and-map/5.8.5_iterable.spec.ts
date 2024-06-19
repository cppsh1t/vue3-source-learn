import { expect, test } from 'vitest'
import { reactive, effect } from './5.8.5_iterable'

test('iterable-test', () => {
    let num = 0
    const map = reactive(
        new Map([
            ['key1', 'value1'],
            ['key2', 'value2'],
        ]),
    )

    effect(() => {
        for (const [_1, _2] of map) {
            num++
        }
    })
    expect(num).toEqual(2)

    map.set('key3', 'value3')
    expect(num).toEqual(5)
})

test('entries-test', () => {
    let num = 0
    const map = reactive(
        new Map([
            ['key1', 'value1'],
            ['key2', 'value2'],
        ]),
    )

    effect(() => {
        for (const [_1, _2] of map.entries()) {
            num++
        }
    })
    expect(num).toEqual(2)

    map.set('key3', 'value3')
    expect(num).toEqual(5)
})