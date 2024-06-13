import { expect, test } from "vitest"
import { reactive } from "./5.7.3_search"

test('includes-test', () => {
    const obj = {}
    const arr = reactive([obj])
    expect(arr.includes(arr[0])).toBeTruthy()
    expect(arr.includes(obj)).toBeTruthy()
})

test('indexof-test', () => {
    const obj = {}
    const arr = reactive([obj])
    expect(arr.indexOf(obj)).toEqual(0)
})

test('last-indexof-test', () => {
    const obj = {}
    const arr = reactive(['shit',obj])
    expect(arr.lastIndexOf(obj)).toEqual(1)
})