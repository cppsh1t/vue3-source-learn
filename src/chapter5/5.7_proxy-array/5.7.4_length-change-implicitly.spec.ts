import { test } from "vitest"
import { reactive, effect } from "./5.7.4_length-change-implicitly"

test('stack-overflow-test', () => {
    const arr = reactive([]) as number[]
    effect(() => {
        arr.push(1)
    })
    effect(() => [
        arr.push(1)
    ])
})