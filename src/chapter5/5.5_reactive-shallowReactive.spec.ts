import { test, expect } from 'vitest'
import { reactive, effect, shallowReactive } from './5.5_shallow-and-reactive'

test('deep-reactive-test', () => {
    const obj = reactive({foo: {bar: 1}})
    let num = 0
    effect(() => {
        obj.foo.bar
        num++
    })
    obj.foo.bar = 2
    expect(num).toEqual(2)
})

test('shallow-reactive-test', () => {
    const obj = shallowReactive({ foo: { bar: 1 } })
    let num = 0
    effect(() => {
        obj.foo.bar
        num++
    })
    obj.foo = {bar: 2}
    expect(num).toEqual(2)
    obj.foo.bar = 3
    expect(num).toEqual(2)
})