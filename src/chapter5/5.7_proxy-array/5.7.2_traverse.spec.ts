import { expect, test } from "vitest"
import { effect, reactive } from "./5.7.2_traverse"

test('for-in-test', () => {
    const arr = reactive(['foo'])
    const other = [] as string[]
    effect(() => {
        for(const key in arr) {
            other.push(key)
        }
    })
    expect(other).toEqual(['0'])
    arr[1] = 'bar'
    expect(other).toEqual(['0', '0', '1'])
    arr.length = 1
    expect(other).toEqual(['0', '0', '1','0'])
})

test('for-of-test', () => {
    const arr = reactive(['foo'])
    const other = [] as string[]
    effect(() => {
        for(const value of arr) {
            other.push(value)
        }
    })
    expect(other).toEqual(['foo'])
    arr[1] = 'bar'
    expect(other).toEqual(['foo', 'foo', 'bar'])
    arr.length = 1
    expect(other).toEqual(['foo', 'foo', 'bar','foo'])
})