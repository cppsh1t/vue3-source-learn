import { expect, test } from 'vitest'
import { effect, ref } from './6.1_ref'

test('ref-test', () => {
    let result = -1
    const refNum = ref(1)
    effect(() => {
        refNum.value
        result = refNum.value
    })
    refNum.value = 3
    expect(result).toEqual(3)
})