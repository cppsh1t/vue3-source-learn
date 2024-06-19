import { expect, test } from 'vitest'
import { effect, reactive, toRef, toRefs } from './6.2_resp-lose'

test('to-refs-test', () => {
    let result = -1
    const obj = reactive({ foo: 1, bar: 2 })
    const newObj = { ...toRefs(obj) }
    expect(newObj.bar.value).toEqual(2)
    effect(() => {
        result = obj.bar
    })
    obj.bar = 42
    expect(newObj.bar.value).toEqual(42)
    newObj.bar.value = 666
    expect(newObj.bar.value).toEqual(666)
})

test('to-ref-test', () => {
    let result = -1
    const obj = reactive({ foo: 1, bar: 2 })
    const refFoo = toRef(obj, 'foo')
    effect(() => {
        result = obj.foo
    })
    refFoo.value = 100
    expect(result).toEqual(100)
})
