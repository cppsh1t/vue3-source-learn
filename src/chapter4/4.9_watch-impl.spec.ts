import { test, expect } from 'vitest'
import { watch, obj } from './4.9_watch-impl'

test('watch-test', () => {
    let str = ''
    watch(obj, () => {
        str = 'foo'
    })

    obj.foo++
    expect(str).toEqual('foo')
})

test('watch-prop-test', () => {
    obj.foo = 1
    let str = ''
    let newNum = -1
    let oldNum = -1
    watch(
        () => obj.foo,
        (newVal, oldVal) => {
            str = 'foo'
            newNum = newVal
            oldNum = oldVal
        },
    )

    obj.foo++
    expect(str).toEqual('foo')
    expect(newNum).toEqual(2)
    expect(oldNum).toEqual(1)
})
