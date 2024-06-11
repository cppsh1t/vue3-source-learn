import { test, expect } from 'vitest'
import { watch, obj } from './4.11_expire-watch'
import { sleep } from 'radash'

test('expire-watch-test', async () => {
    let finalData = -1
    let time = 350
    let num = 40
    watch(obj, async (_1, _2, onInvalidate) => {
        let expired = false
        onInvalidate(() => {
            expired = true
        })

        const oldTime = time
        time -= 200
        const oldNum = num
        num++
        const res = await sleep(oldTime).then(() => oldNum + 1)

        if (!expired) {
            console.log(`set from ${oldTime}`, res)
            finalData = res
        }
    })

    // 第一次修改
    obj.foo++
    setTimeout(() => {
        // 50ms 后做第二次修改
        obj.foo++
    }, 50)

    await sleep(750)
    expect(finalData).toEqual(42)
})
