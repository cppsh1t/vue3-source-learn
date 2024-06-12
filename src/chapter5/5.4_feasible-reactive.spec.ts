import { test, expect } from 'vitest'
import { effect, reactive } from './5.4_feasible-reactive'

test('value-not-change-test', () => {
    const obj = reactive({foo: 1})
    let num = 0
    effect(() => {
        console.log(obj.foo)
        num++
    })
    obj.foo = obj.foo
    expect(num).toEqual(1)
})

test('NaN-compare-test', () => {
    const obj = reactive({foo: 1})
    obj.foo = NaN
    let num = 0
    effect(() => {
        console.log(obj.foo)
        num++
    })
    obj.foo = NaN
    expect(num).toEqual(1)
})

test('prototype-test', () => {
    let num = 0
    const obj = {}
    const proto = {bar: 1}
    const child = reactive(obj)
    const parent = reactive(proto)
    Object.setPrototypeOf(child, parent)
    effect(() => {
        (child as {bar: number}).bar
        num++
    })
    ;(child as {bar: number}).bar = 2
    expect(num).toEqual(2)
})