//储存副作用的桶
const bucket = new Set<() => unknown>()

//原始数据
const data = {text: 'hello world'}

//副作用函数
function effect() {
    document.body.innerText = obj.text
}

//对原始数据的拦截
const obj = new Proxy(data, {
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

export function testSelf() {
    obj.text = 'hello not vue'
}