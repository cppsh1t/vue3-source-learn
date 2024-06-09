import { sleep } from "radash"

//储存副作用的桶
const bucket = new Set<() => unknown>()

//原始数据
const data = {text: 'hello world'}

//副作用函数
function effect() {
    document.body.innerText = proxyObj.text
}

//对原始数据的拦截
const proxyObj = new Proxy(data, {
    //拦截读取操作
    get(target, key: keyof typeof data) {
        bucket.add(effect)
        console.log('do get, now bucket: ', bucket)
        return target[key]
    },

    set(target, key: keyof typeof data, newVal) {
        target[key] = newVal
        bucket.forEach(fn => fn())
        console.log('do set')
        return true
    }
})

effect()

export async function test() {
    await sleep(1000)
    proxyObj.text = 'hello not vue'
}