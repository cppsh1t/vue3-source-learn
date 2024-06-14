import { expect, test } from "vitest"
import { reactive, effect } from "./5.8.1_how-to-proxy"

test('set-size-test', () => {
    const set = reactive(new Set([1, 2, 3]))
    expect(set.size).toEqual(3)
    let num = 0
    effect(() => {
        set.size
        num++
        console.log('debug')
    })
    set.add(4)
    expect(num).toEqual(2)
})

test('map-get-test', () => {
    let result 
    const map = reactive(new Map<string, number>([['key', 1]]))
    effect(() => {
        result = map.get('key')
    })
    map.set('key', 2)
    expect(result).toEqual(2)
})

test('map-size-test', () => {
    let num = 0
    const map = reactive(new Map<string, number>([['key', 1]]))
    effect(() => {
        map.get('key')
        num++
    })
    map.set('key', 2)
    expect(num).toEqual(2)
})