import { expect, test } from 'vitest'
import { computed, effect, obj } from './4.8_lazy-and-computed'

test('lazy-test', () => {
    const arr = [] as number[]
    const effectFn = effect(() => {
        const result = obj.foo + obj.bar
        arr.push(result)
        return result
    }, {lazy: true})

    expect(arr).toEqual([])
    const result = effectFn()
    expect(arr).toEqual([2])
    expect(result).toEqual(2)
})

test('computed-test', () => {
    const sum = computed(() => obj.foo + obj.bar)
    const arr = [] as number[]
    effect(() => arr.push(sum.value))
    expect(sum.value).toEqual(2)
    expect(arr).toEqual([2])

    obj.foo += 1
    expect(sum.value).toEqual(3)
    expect(arr).toEqual([2,3])
})