import { test, expect } from 'vitest'
import { effect, obj } from './5.1_reflect'

test('reflect-test', () => {
    const arr = [] as number[]
    effect(() => arr.push(obj.bar))
    expect(arr).toEqual([1])
    obj.foo++
    expect(arr).toEqual([1,2])
})