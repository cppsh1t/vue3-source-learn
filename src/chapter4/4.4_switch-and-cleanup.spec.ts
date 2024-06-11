import { test, expect } from "vitest";
import { effect, obj } from "./4.4_switch-and-cleanup";

test('switch-and-cleanup-test', () => {
    let time = 0
    effect(() => {
        document.body.innerText = obj.ok ? obj.text : 'not'
        time += 1
        console.log('invoke effect func')
    })
    expect(time).toEqual(1)
    obj.ok = false
    expect(document.body.innerText).toEqual('not')
    expect(time).toEqual(2)
    obj.text = 'what hell'
    expect(document.body.innerText).toEqual('not')
    expect(time).toEqual(2)
})