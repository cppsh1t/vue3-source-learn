import { test, expect } from "vitest"
import { effect, obj } from "./5.3_proxy-object"

test('has-prop-test', () => {
    let num = 0
    effect(() => {
        'foo' in obj
        num++
    })
    obj.foo = 2
    expect(num).toEqual(2)
})

test('for-in-loop-test', () => {
    let num = 0
    effect(() => {
        for(const _ in obj.baz) {
            num++
            break
        }
    })
    obj.baz = [42, 42]
    expect(num).toEqual(2)
})

test('delete-test', () => {
    let num = 0
    effect(() => {
        //@ts-ignore
        const _ =obj.bar
        num++
    })
    delete obj.bar
    expect(num).toEqual(2)
})