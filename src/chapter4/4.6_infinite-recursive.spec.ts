import { test } from 'vitest'
import { effect, obj } from './4.6_infinite-recursive'

test('infinite-recursive-test', () => {
    effect(() => obj.foo++)
})