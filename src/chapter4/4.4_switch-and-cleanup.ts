type EffectType = { deps: (Set<() => unknown>)[] } & (() => unknown)

// 存储副作用函数的桶
const bucket = new WeakMap<any, Map<any, Set<() => unknown>>>()

const data = { ok: true, text: 'hello world' }

// 用一个全局变量存储被注册的副作用函数
let activeEffect: EffectType

// effect 函数用于注册副作用函数
function effect(fn: () => unknown) {
    const effectFn: EffectType = () => {
        // 调用 cleanup 函数完成清除工作
        cleanup(effectFn)

        // 当 effectFn 执行时，将其设置为当前激活的副作用函数
        activeEffect = effectFn
        fn()
    }

    // activeEffect.deps 用来存储所有与该副作用函数相关联的依赖集合
    effectFn.deps = []
    // 执行副作用函数
    effectFn()
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

    // 把当前激活的副作用函数添加到依赖集合 deps 中
    deps.add(activeEffect)
    // deps 就是一个与当前副作用函数存在联系的依赖集合
    // 将其添加到 activeEffect.deps 数组中
    activeEffect.deps.push(deps) // 新增
}

// 在 set 拦截函数内调用 trigger 函数触发变化
function trigger(target: any, key: keyof typeof target) {
    const depsMap = bucket.get(target)
    if (depsMap) {
        const effects = depsMap.get(key)
        const effectsToRun = new Set(effects)
        effectsToRun.forEach(effectFn => effectFn())
    }

    return true
}

function cleanup(effectFn: EffectType) {
    for (let i = 0; i < effectFn.deps.length; i++) {
        //deps是依赖集合
        const deps = effectFn.deps[i]
        deps.delete(effectFn) 
    }
    effectFn.deps.length = 0 
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
        ;(target[key] as typeof newVal) = newVal
        // 把副作用函数从桶里取出并执行
        return trigger(target, key)
    },
})

export { effect, obj }
