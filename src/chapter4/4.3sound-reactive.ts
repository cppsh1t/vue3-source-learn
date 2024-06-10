// 存储副作用函数的桶
const bucket = new WeakMap<any, Map<any, Set<() => unknown>>>()

//原始数据
const data = { text: 'hello world' }

// 用一个全局变量存储被注册的副作用函数
let activeEffect: () => unknown
// effect 函数用于注册副作用函数
function effect(fn: () => unknown) {
    // 当调用 effect 注册副作用函数时，将副作用函数 fn 赋值给activeEffect
    activeEffect = fn
    // 执行副作用函数
    fn()
}

// 在 get 拦截函数内调用 track 函数追踪变化
function track(target: any, key: keyof typeof target) {
    // 没有 activeEffect，直接 return
    if (!activeEffect) return
    let depsMap = bucket.get(target)
    if (!depsMap) {
        bucket.set(target, (depsMap = new Map()))
    }
    let deps = depsMap.get(key)
    if (!deps) {
        depsMap.set(key, (deps = new Set()))
    }
    deps.add(activeEffect)
}

// 在 set 拦截函数内调用 trigger 函数触发变化
function trigger(target: any, key: keyof typeof target) {
    const depsMap = bucket.get(target)
    if (depsMap) {
        const effects = depsMap.get(key)
        effects && effects.forEach(fn => fn())
    }

    return true
}


const obj = new Proxy(data, {
    // 拦截读取操作
    get(target, key: keyof typeof data) {
        // 将副作用函数 activeEffect 添加到存储副作用函数的桶中
        track(target, key)
        // 返回属性值
        return target[key]
    },
    // 拦截设置操作
    set(target, key: keyof typeof data, newVal) {
        // 设置属性值
        target[key] = newVal
        // 把副作用函数从桶里取出并执行
        return trigger(target, key)
    }
})


export { effect, obj }