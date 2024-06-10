import { test, expect } from "vitest";
import { effect, obj } from "./4.3sound-reactive";

test('sound-reactive-test', () => {
    obj.text = 'nothing'
    effect(() => {
        document.body.innerText = obj.text
    })
    expect(document.body.innerText).toEqual('nothing')
    obj.text = 'wtf'
    expect(document.body.innerText).toEqual('wtf')
})