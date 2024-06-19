type EffectType<T> = { deps: Set<() => T>[] } & (() => T) & { options: EffectOption }
type EffectOption = Partial<{ scheduler: (func: () => unknown) => unknown; lazy: boolean }>
type WatchOption = Partial<{ immediate: boolean; flush: 'post' | 'pre' }>
type TriggerType = 'SET' | 'ADD' | 'DELETE'

const ITERATE_KEY = Symbol()
const MAP_KEY_ITERATE_KEY = Symbol()

// 存储副作用函数的桶
const bucket = new WeakMap<any, Map<any, Set<EffectType<any>>>>()

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
        // 执行副作用函数
        effectFn()
    }
    return effectFn
}

// 在 get 拦截函数内调用 track 函数追踪变化
function track(target: any, key: keyof typeof target) {
    // 当禁止追踪时，直接返回
    if (!activeEffect || !shouldTrack) return

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
function trigger(target: any, key: keyof typeof target, newVal: any, type: TriggerType = 'SET') {
    const depsMap = bucket.get(target)
    if (!depsMap) return

    // 取得与 key 相关联的副作用函数
    const effects = depsMap.get(key)

    // 将与 key 相关联的副作用函数添加到 effectsToRun
    const effectsToRun = new Set<EffectType<any>>()
    effects &&
        effects.forEach((effectFn) => {
            // 如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn)
            }
        })

    // 将与 ITERATE_KEY 相关联的副作用函数也添加到 effectsToRun
    if (type === 'ADD' || type === 'DELETE' || (type === 'SET' && Object.prototype.toString.call(target) === '[object Map]')) {
        const iterateEffects = depsMap.get(ITERATE_KEY)
        iterateEffects &&
            iterateEffects.forEach((effectFn) => {
                if (effectFn !== activeEffect) {
                    effectsToRun.add(effectFn)
                }
            })
    }

    if ((type === 'ADD' || type === 'DELETE') &&  Object.prototype.toString.call(target) === '[object Map]') {
        const iterateEffects = depsMap.get(MAP_KEY_ITERATE_KEY)
        iterateEffects &&
            iterateEffects.forEach((effectFn) => {
                if (effectFn !== activeEffect) {
                    effectsToRun.add(effectFn)
                }
            })
    }

    // 当操作类型为 ADD 并且目标对象是数组时，应该取出并执行那些与 length 属性相关联的副作用函数
    if (type === 'ADD' && Array.isArray(target)) {
        // 取出与 length 相关联的副作用函数
        const lengthEffects = depsMap.get('length')
        // 将这些副作用函数添加到 effectsToRun 中，待执行
        lengthEffects &&
            lengthEffects.forEach((effectFn) => {
                if (effectFn !== activeEffect) {
                    effectsToRun.add(effectFn)
                }
            })
    }

    // 如果操作目标是数组，并且修改了数组的 length 属性
    if (Array.isArray(target) && key === 'length') {
        // 对于索引大于或等于新的 length 值的元素，
        // 需要把所有相关联的副作用函数取出并添加到 effectsToRun 中待执行
        depsMap.forEach((effects, key) => {
            if (key >= newVal) {
                effects.forEach((effectFn) => {
                    if (effectFn !== activeEffect) {
                        effectsToRun.add(effectFn)
                    }
                })
            }
        })
    }

    effectsToRun.forEach((effectFn) => {
        // 如果一个副作用函数存在调度器，则调用该调度器，并将副作用函数作为参数传递
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
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
        scheduler() {
            if (!dirty) {
                dirty = true
                const result = effectFn()
                trigger(obj, 'value', result)
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

function watch<T>(getter: () => T, cb: (newValue: T, oldValue: T, onInvalidate: (func: () => unknown) => void) => void, options?: WatchOption): void
function watch<T>(source: T, cb: (newValue: T, oldValue: T, onInvalidate: (func: () => unknown) => void) => void, options?: WatchOption): void

function watch(source: any, cb: (newValue: any, oldValue: any, onInvalidate: (func: () => unknown) => void) => void, options: WatchOption = {}) {
    // 定义getter
    let getter: () => any

    // 如果 source 是函数，说明用户传递的是 getter，所以直接把 source 赋值给 getter
    if (typeof source === 'function') {
        getter = source
    } else {
        // 否则按照原来的实现调用 traverse 递归地读取
        getter = () => traverse(source)
    }

    // 定义旧值与新值
    let oldValue: any, newValue

    // cleanup 用来存储用户注册的过期回调
    let cleanup: () => unknown
    // 定义 onInvalidate 函数
    function onInvalidate(func: () => unknown) {
        cleanup = func
    }

    // 提取 scheduler 调度函数为一个独立的 job 函数
    const job = () => {
        newValue = effectFn()
        if (cleanup !== undefined) {
            cleanup()
        }
        // 将 onInvalidate 作为回调函数的第三个参数，以便用户使用
        cb(newValue, oldValue, onInvalidate)
        oldValue = newValue
    }

    // 使用 effect 注册副作用函数时，开启 lazy 选项，并把返回值存储到 effectFn 中以便后续手动调用
    const effectFn = effect(() => getter(), {
        lazy: true,
        // 使用 job 函数作为调度器函数
        scheduler: () => {
            if (options.flush === 'post') {
                const promise = Promise.resolve()
                promise.then(job)
            } else if (options.flush === 'pre') {
                throw new Error("don't support now")
            } else {
                job()
            }
        },
    })

    if (options.immediate) {
        // 当 immediate 为 true 时立即执行 job，从而触发回调执行
        job()
    } else {
        // 手动调用副作用函数，拿到的值就是旧值
        oldValue = effectFn()
    }
}

function traverse(value: any, seen = new Set()) {
    // 如果要读取的数据是原始值，或者已经被读取过了，那么什么都不做
    if (typeof value !== 'object' || value === null || seen.has(value)) return
    // 将数据添加到 seen 中，代表遍历地读取过了，避免循环引用引起的死循环
    seen.add(value)
    // 暂时不考虑数组等其他结构
    // 假设 value 就是一个对象，使用 for...in 读取对象的每一个值，并递归地调用 traverse 进行处理
    for (const k in value) {
        traverse(value[k], seen)
    }

    return value
}

function getTriggerType<T>(target: T, key: string | symbol): TriggerType {
    // 如果代理目标是数组，则检测被设置的索引值是否小于数组长度
    // 如果是，则视作 SET 操作，否则是 ADD 操作
    return Array.isArray(target) ? (Number(key) < target.length ? 'SET' : 'ADD') : Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
}

// 一个标记变量，代表是否进行追踪。默认值为 true，即允许追踪
let shouldTrack = true
const arrayInstrumentations: Record<string, Function> = (() => {
    const it: Record<string, Function> = {}
    ;['includes', 'indexOf', 'lastIndexOf'].forEach((method) => {
        //@ts-ignore
        const originMethod = Array.prototype[method]
        it[method] = function (...args: [searchElement: any, fromIndex?: number | undefined]) {
            // this 是代理对象，先在代理对象中查找，将结果存储到 res 中
            let res = originMethod.apply(this, args)

            if (res === false || res === -1) {
                // res 为 false 说明没找到，通过 this.raw 拿到原始数组，再去其中查找，并更新 res 值
                res = originMethod.apply((this as any).raw, args)
            }
            // 返回最终结果
            return res
        }
    })
    ;['push', 'pop', 'shift', 'unshift', 'splice'].forEach((method) => {
        // 取得原始 push 方法
        //@ts-ignore
        const originMethod = Array.prototype[method]
        // 重写
        it[method] = function (...args: [searchElement: any, fromIndex?: number | undefined]) {
            // 在调用原始方法之前，禁止追踪
            shouldTrack = false
            // push 方法的默认行为
            let res = originMethod.apply(this, args)
            // 在调用原始方法之后，恢复原来的行为，即允许追踪
            shouldTrack = true
            return res
        }
    })

    return it
})()

// 定义一个对象，将自定义的 add 方法定义到该对象下
const mutableInstrumentations: { raw: any } & any = {
    [Symbol.iterator](...args: any[]) {
        return this.iterationMethod(args)
    },
    entries(...args: any[]) {
        return this.iterationMethod(args)
    },
    values(...args: any[]) {
        return this.valuesIterationMethod(args)
    },
    keys() {
        return this.keysIterationMethod()
    },
    add(key: any) {
        // this 仍然指向的是代理对象，通过 raw 属性获取原始数据对象
        const target: any = this.raw
        const hadKey = target.has(key)
        // 通过原始数据对象执行 add 方法添加具体的值，
        // 注意，这里不再需要 .bind 了，因为是直接通过 target 调用并执行的
        const res = target.add(key)
        // 只有在值不存在的情况下，才需要触发响应
        if (!hadKey) {
            trigger(target, key, undefined, 'ADD')
        }
        // 返回操作结果
        return res
    },
    delete(key: any): boolean {
        const target = this.raw
        const hadKey = target.has(key)
        const res = target.delete(key)
        // 当要删除的元素确实存在时，才触发响应
        if (hadKey) {
            trigger(target, key, undefined, 'DELETE')
        }
        return res
    },
    get(key: any): any {
        // 获取原始对象
        const target = this.raw
        // 判断读取的 key 是否存在
        const had = target.has(key)
        // 追踪依赖，建立响应联系
        track(target, key)
        // 如果存在，则返回结果。这里要注意的是，如果得到的结果 res 仍然是可代理的数据，
        // 则要返回使用 reactive 包装后的响应式数据
        if (had) {
            const res = target.get(key)
            return typeof res === 'object' ? reactive(res) : res
        }
    },
    set(key: any, value: any) {
        const target = this.raw
        const had = target.has(key)
        // 获取旧值
        const oldValue = target.get(key)
        // 获取原始数据，由于 value 本身可能已经是原始数据，所以此时 value.raw 不存在，则直接使用 value
        const rawValue = value.raw || value
        // 设置新值
        target.set(key, rawValue)
        // 如果不存在，则说明是 ADD 类型的操作，意味着新增
        if (!had) {
            trigger(target, key, undefined, 'ADD')
        } else if (oldValue !== value || (oldValue === oldValue && value === value)) {
            // 如果不存在，并且值变了，则是 SET 类型的操作，意味着修改
            trigger(target, key, undefined, 'SET')
        }
    },
    forEach(callback: (...item: any[]) => void, thisArg: any) {
        // wrap 函数用来把可代理的值转换为响应式数据
        const wrap = (val: any) => (typeof val === 'object' ? reactive(val) : val)
        const target = this.raw
        // 与 ITERATE_KEY 建立响应联系
        track(target, ITERATE_KEY)
        // 通过原始数据对象调用 forEach 方法，并把 callback 传递过去
        target.forEach((v: any, k: any) => {
            // 手动调用 callback，用 wrap 函数包裹 value 和 key 后再传给 callback，这样就实现了深响应
            callback.call(thisArg, wrap(v), wrap(k), this)
        })
    },
    iterationMethod() {
        // 获取原始数据对象 target
        const target = this.raw
        // 获取原始迭代器方法
        const itr = target[Symbol.iterator]()
        const wrap = (val: any) => (typeof val === 'object' && val !== null ? reactive(val) : val)
        // 调用 track 函数建立响应联系
        track(target, ITERATE_KEY)
        // 返回自定义的迭代器
        return {
            // 实现可迭代协议
            [Symbol.iterator]() {
                return this
            },
            next() {
                // 调用原始迭代器的 next 方法获取 value 和 done
                const { value, done } = itr.next()
                return {
                    // 如果 value 不是 undefined，则对其进行包裹
                    value: value ? [wrap(value[0]), wrap(value[1])] : value,
                    done,
                }
            },
        }
    },
    valuesIterationMethod() {
        // 获取原始数据对象 target
        const target = this.raw
        // 通过 target.values 获取原始迭代器方法
        const itr = target.values()

        const wrap = (val: any) => (typeof val === 'object' ? reactive(val) : val)

        track(target, ITERATE_KEY)

        // 将其返回
        return {
            next() {
                const { value, done } = itr.next()
                return {
                    // value 是值，而非键值对，所以只需要包裹 value 即可
                    value: wrap(value),
                    done,
                }
            },
            [Symbol.iterator]() {
                return this
            },
        }
    },
    keysIterationMethod() {
        // 获取原始数据对象 target
        const target = this.raw
        // 获取原始迭代器方法
        const itr = target.keys()

        const wrap = (val: any) => (typeof val === 'object' ? reactive(val) : val)

        // 调用 track 函数追踪依赖，在副作用函数与 MAP_KEY_ITERATE_KEY 之间建立响应联系
        track(target, MAP_KEY_ITERATE_KEY)

        // 将其返回
        return {
            next() {
                const { value, done } = itr.next()
                return {
                    value: wrap(value),
                    done,
                }
            },
            [Symbol.iterator]() {
                return this
            },
        }
    },
}

function createReactive<T extends object>(obj: T, isShallow = false, isReadOnly = false): T {
    return new Proxy<T>(obj, {
        // 拦截读取操作
        get(target, key, receiver: any) {
            // 代理对象可以通过 raw 属性访问原始数据
            if (key === 'raw') {
                return target
            }

            if (target instanceof Set || target instanceof Map) {
                if (key === 'size') {
                    // 调用 track 函数建立响应联系
                    track(target, ITERATE_KEY)
                    return Reflect.get(target, key, target)
                }
                return mutableInstrumentations[key]
            }

            //如果操作的目标对象是数组，并且 key 存在于 arrayInstrumentations 上，那么返回定义在 arrayInstrumentations 上的值
            if (Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
                return Reflect.get(arrayInstrumentations, key, receiver)
            }

            // 添加判断，如果 key 的类型是 symbol，则不进行追踪
            if (!isReadOnly && typeof key !== 'symbol') {
                track(target, key)
            }

            const result = Reflect.get(target, key, receiver)

            // 如果是浅响应，则直接返回原始值
            if (isShallow) {
                return result
            }
            if (typeof result === 'object' && result !== null) {
                // 如果数据为只读，则调用 readonly 对值进行包装
                return isReadOnly ? readonly(result) : reactive(result)
            }
            return result
        },

        // 拦截设置操作
        set(target, key, newVal, receiver: any) {
            if (isReadOnly) {
                console.warn(`${String(key)} is readonly!`)
                return true
            }
            //@ts-ignore
            const oldVal = target[key]

            const type = getTriggerType(target, key)
            const result = Reflect.set(target, key, newVal, receiver)

            // target === receiver.raw 说明 receiver 就是 target 的代理对象
            if (target === receiver.raw) {
                if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
                    trigger(target, key, newVal, type)
                }
            }

            return result
        },

        // key in obj opreation
        has(target, key) {
            track(target, key)
            return Reflect.has(target, key)
        },

        // for in loop opreation
        ownKeys(target) {
            /// 如果操作目标 target 是数组，则使用 length 属性作为 key 并建立响应联系
            track(target, Array.isArray(target) ? 'length' : ITERATE_KEY)
            return Reflect.ownKeys(target)
        },

        deleteProperty(target, key) {
            if (isReadOnly) {
                console.warn(`${String(key)} is readonly!`)
                return true
            }
            // 检查被操作的属性是否是对象自己的属性
            const hadKey = Object.prototype.hasOwnProperty.call(target, key)
            const res = Reflect.deleteProperty(target, key)
            if (res && hadKey) {
                // 只有当被删除的属性是对象自己的属性并且成功删除时，才触发更新
                trigger(target, key, undefined, 'DELETE')
            }
            return res
        },
    })
}

// 定义一个 Map 实例，存储原始对象到代理对象的映射
const reactiveMap = new Map<object, object>()

function reactive<T extends object>(obj: T): T {
    // 优先通过原始对象 obj 寻找之前创建的代理对象，如果找到了，直接返回已有的代理对象
    const existionProxy = reactiveMap.get(obj)
    if (existionProxy) return existionProxy as T

    // 否则，创建新的代理对象
    const proxy = createReactive(obj, false, false)
    // 存储到 Map 中，从而避免重复创建
    reactiveMap.set(obj, proxy)
    return proxy
}

function shallowReactive<T extends object>(obj: T): T {
    return createReactive(obj, true, false)
}

function readonly<T extends object>(obj: T): T {
    return createReactive(obj, false, true)
}

function shallowReadonly<T extends object>(obj: T): T {
    return createReactive(obj, true, true)
}

export { effect, computed, watch, reactive, shallowReactive, readonly, shallowReadonly }
