import { expect, test } from 'vitest'
import { readonly, shallowReadonly, effect } from './5.6_shallow-and-readonly'

test('readonly-test', () => {
    const obj = readonly({ foo: 1 })
    let num = 0
    effect(() => {
        obj.foo
        num++
    })
    obj.foo = 2
    expect(obj.foo).toEqual(1)
    expect(num).toEqual(1)
})

test('deep-readonly-test', () => {
    const obj = readonly({ foo: { bar: 1 } })
    obj.foo.bar = 42
    expect(obj.foo.bar).toEqual(1)
})

test('shallow-readonly-test', () => {
    const obj = shallowReadonly({ foo: { bar: 1 } })
    obj.foo.bar = 42
    expect(obj.foo.bar).toEqual(42)
})