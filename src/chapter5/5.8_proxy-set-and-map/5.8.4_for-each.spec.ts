import { expect, test } from 'vitest'
import { effect, reactive } from './5.8.4_for-each'

test('map-for-each-test', () => {
    let num = 0
    const map = reactive(new Map([[{ key: 1 }, { value: 1 }]]))
    effect(() => {
        map.forEach((_) => {
            num++
        })
    })
    expect(num).toEqual(1)
    map.set({ key: 2 }, { value: 2 })
    expect(num).toEqual(3)
})

test('nested-for-each-test', () => {
    let num = 0
    const key = { key: 1 }
    const value = new Set([1, 2, 3])
    const map = reactive(new Map([[key, value]]))

    effect(() => {
        map.forEach((item) => {
            item.size
        })
        num++
    })
    expect(num).toEqual(1)
    map.get(key)!.delete(1)
    expect(num).toEqual(2)
})