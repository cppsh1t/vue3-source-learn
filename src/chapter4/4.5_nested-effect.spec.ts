import { test, expect } from 'vitest'
import { effect, obj } from './4.5_nested-effect'

test('nested-effect-test', () => {
    let temp1, temp2
    let fnTime1 = 0, fnTime2 = 0

    // effectFn1 嵌套了 effectFn2
    effect(function effectFn1() {
        console.log(`excute effectFn1, time: ${++fnTime1}`)

        effect(function effectFn2() {
            console.log(`excute effectFn2, time: ${++fnTime2}`)
            // 在 effectFn2 中读取 obj.bar 属性
            temp2 = obj.bar
        })
        // 在 effectFn1 中读取 obj.foo 属性
        temp1 = obj.foo
    })
    expect([fnTime1, fnTime2]).toEqual([1,1])
    obj.foo = false
    expect(fnTime1).toEqual(2)
})
