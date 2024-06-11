import { test, expect } from 'vitest'
import { watch, obj } from './4.10_immediate-watch'
import { sleep } from 'radash'

test('immediate-watch-test', () => {
    let oldValue, newValue
    watch(
        () => obj.foo,
        (newVal, oldVal) => {
            newValue = newVal
            oldValue = oldVal
        },
        { immediate: true },
    )
    expect(oldValue).toBeUndefined()
    expect(newValue).toEqual(1)
})

test('watch-flush-test', async () => {
    const arr = [] as number[]

    watch(() => obj.bar, () => {
        arr.push(2)
    }, {flush: 'post'})

    obj.bar++
    arr.push(1)
    await sleep(100)
    expect(arr).toEqual([1,2])
})