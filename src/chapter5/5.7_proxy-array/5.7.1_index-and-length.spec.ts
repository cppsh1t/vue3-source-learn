import { expect, test } from "vitest"
import { reactive, effect } from "./5.7.1_index-and-length"

test('simple-array-test', () => {
    let result = ''
    const arr = reactive(['foo'])
    effect(() => {
        result = arr[0]
    })
    arr[0] = 'bar'
    expect(result).toEqual('bar')
})

test('length-test', () => {
    let result = ''
    const arr = reactive(['foo'])
    effect(() => result = arr[arr.length - 1])
    arr.push('bar')
    expect(result).toEqual('bar')
})

test('length-change-test', () => {
    const arr = reactive(['foo'])
    let result
    effect(() => {
        result = arr.length > 0 ? arr[0] : undefined
    })
    expect(result).toEqual('foo')
    arr.length = 0
    expect(result).toBeUndefined()
}) 