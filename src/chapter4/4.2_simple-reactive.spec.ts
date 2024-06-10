import { testSelf } from "./4.2_simple-reactive"
import { test, expect } from 'vitest'



test('simple-reactive-test', async () => {
    expect(document.body.innerText).toEqual("hello world")
    testSelf()
    expect(document.body.innerText).toEqual("hello not vue")
})
