type EffectType<T> = { deps: Set<() => T>[] } & (() => T) & { options: EffectOption }
type EffectOption = Partial<{ scheduler: (func: () => unknown) => unknown; lazy: boolean }>

// 存储副作用函数的桶
const bucket = new WeakMap<any, Map<any, Set<EffectType<any>>>>()

const data = { foo: 1, bar: 1 }

// 用一个全局变量存储被注册的副作用函数
let activeEffect: EffectType<any>
// effect 栈
const effectStack: EffectType<any>[] = []

// effect 函数用于注册副作用函数
function effect<T>(fn: () => T, options: EffectOption = {}) {
    const effectFn: EffectType<T> = () => {
        // 调用 cleanup 函数完成清除工作
        cleanup(effectFn)

        // 当 effectFn 执行时，将其设置为当前激活的副作用函数
        activeEffect = effectFn

        // 在调用副作用函数之前将当前副作用函数压入栈中
        effectStack.push(effectFn)
        // 将 fn 的执行结果存储到 res 中
        const res = fn()
        // 在当前副作用函数执行完毕后，将当前副作用函数弹出栈，并把 activeEffect 还原为之前的值
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
        return res
    }
    // 将 options 挂载到 effectFn 上
    effectFn.options = options
    // activeEffect.deps 用来存储所有与该副作用函数相关联的依赖集合
    effectFn.deps = []

    // 只有非 lazy 的时候，才执行
    if (!options.lazy) {
        // 新增
        // 执行副作用函数
        effectFn()
    }
    return effectFn
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
        const effectsToRun = new Set<EffectType<any>>()
        effects &&
            effects.forEach((effectFn) => {
                // 如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行
                if (effectFn !== activeEffect) {
                    effectsToRun.add(effectFn)
                }
            })
        effectsToRun.forEach((effectFn) => {
            // 如果一个副作用函数存在调度器，则调用该调度器，并将副作用函数作为参数传递
            if (effectFn.options.scheduler) {
                effectFn.options.scheduler(effectFn)
            } else {
                effectFn()
            }
        })
    }

    return true
}

function cleanup(effectFn: EffectType<any>) {
    for (let i = 0; i < effectFn.deps.length; i++) {
        //deps是依赖集合
        const deps = effectFn.deps[i]
        deps.delete(effectFn)
    }
    effectFn.deps.length = 0
}

function computed<T>(getter: () => T) {
    // value 用来缓存上一次计算的值
    let value: T
    // dirty 标志，用来标识是否需要重新计算值，为 true 则意味着“脏”，需要计算
    let dirty = true

    const effectFn = effect(getter, {
        lazy: true,
        scheduler(func) {
            if (!dirty) {
                dirty = true
                func()
                trigger(obj, 'value')
            }
        },
    })
    const obj = {
        // 当读取 value 时才执行 effectFn
        get value() {
            // 只有“脏”时才计算值，并将得到的值缓存到 value 中
            if (dirty) {
                value = effectFn()
                dirty = false
            }
            track(obj, 'value')
            return value
        },
    }
    return obj
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

export { effect, obj, computed }
