import { expect, test } from 'vitest'
import { effect, obj } from './4.7_schedule-excute'
import { sleep } from 'radash'

test('schedule-excute-test-async', async () => {
    const arr = [] as any[]
    effect(() => arr.push(obj.foo), {
        scheduler(fn) {
            setTimeout(fn)
        },
    })
    obj.foo++
    arr.push('over')

    await sleep(100)
    expect(arr).toEqual([1, 'over', 2])
})

test('schedule-excute-test-batch', async () => {
    //初始化
    obj.foo = 1
    const arr = [] as number[]

    // 定义一个任务队列
    const jobQueue = new Set<() => unknown>()
    // 使用 Promise.resolve() 创建一个 promise 实例，我们用它将一个任务添加到微任务队列
    const promise = Promise.resolve()

    // 一个标志代表是否正在刷新队列
    let isFlushing = false
    function flushJob() {
        // 如果队列正在刷新，则什么都不做
        if (isFlushing) return
        // 设置为 true，代表正在刷新
        isFlushing = true
        // 在微任务队列中刷新 jobQueue 队列
        promise
            .then(() => {
                jobQueue.forEach((job) => job())
            })
            .finally(() => {
                // 结束后重置 isFlushing
                isFlushing = false
            })
    }

    effect(() => arr.push(obj.foo), {
        scheduler(fn) {
            // 每次调度时，将副作用函数添加到 jobQueue 队列中
            jobQueue.add(fn)
            // 调用 flushJob 刷新队列
            flushJob()
        },
    })

    obj.foo++
    obj.foo++
    await sleep(100)
    expect(arr).toEqual([1, 3])
})
