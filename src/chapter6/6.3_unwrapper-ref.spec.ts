import { expect, test } from "vitest"
import { toRefs, reactive, proxyRefs } from "./6.3_unwrapper-ref"

test('unwrapper-ref-test', () => {
    const obj = reactive({ foo: 1, bar: 2 })
    const newObj = proxyRefs({ ...toRefs(obj) })
    expect(newObj.bar).toEqual(2)
})

test('unwrapper-ref-set-test', () => {
    const obj = reactive({ foo: 1, bar: 2 })
    const newObj = proxyRefs({ ...toRefs(obj) })
    newObj.foo = 42
    expect(obj.foo).toEqual(42)
})