import { RenderOption, VNode } from '../utils/type'

export function getDefaultRenderOption(): RenderOption {
    return {
        createElement: function (tag: keyof HTMLElementTagNameMap): Element {
            return document.createElement(tag)
        },
        setElementText: function (el: Element, text: string): void {
            el.textContent = text
        },
        insert: function (el: Element | Text | Comment, parent: Element, anchor?: any): void {
            parent.appendChild(el)
        },
        patchProps: function (el: Element, key: string, preValue: any | undefined, nextValue: any): void {
            const castedEl = el as Element & Record<string, any>
            const { is, type } = isEvent(key)
            if (is) {
                const invokers = (el as any)._eventInvoker || ((el as any)._eventInvoker = {})
                let invoker = invokers[key]
                if (nextValue) {
                    if (!invoker) {
                        invoker = (el as any)._eventInvoker[key] = (e: Event) => {
                            if (e.timeStamp < invoker.attached) return
                            if (Array.isArray(invoker.value)) {
                                invoker.value.forEach((fn: (e: Event) => unknown) => fn(e))
                            } else {
                                invoker.value(e)
                            }
                        }
                        invoker.value = nextValue
                        invoker.attached = performance.now()
                        el.addEventListener(type!, invoker)
                    } else {
                        invoker.value = nextValue
                    }
                } else if (invoker) {
                    el.removeEventListener(type!, invoker)
                }
            } else if (key === 'class') {
                el.className = nextValue || ''
            } else if (shouldSetAsProps(el, key, nextValue)) {
                const type = typeof castedEl[key]
                if (type === 'boolean' && nextValue === '') {
                    castedEl[key] = true
                } else {
                    castedEl[key] = nextValue
                }
            } else {
                el.setAttribute(key, nextValue)
            }
        },
        createText(text) {
            return document.createTextNode(text)
        },
        setText(el, text) {
            el.nodeValue = text
        },
        createComment(text) {
            return document.createComment(text)
        },
    }
}

const defaultRenderOptions = getDefaultRenderOption()

function shouldSetAsProps(el: Element, key: string, value: string) {
    // 特殊处理
    if (key === 'form' && el.tagName === 'INPUT') return false
    // 兜底
    return key in el
}

function isEvent(eventString: string) {
    const is = /^\$on/.test(eventString)
    const type = is ? (eventString.slice(3).toLowerCase() as keyof ElementEventMap) : undefined
    return { is, type }
}

function unmount(node: VNode) {
    if (node.type === 'fragment') {
        ;(node.children as VNode[]).forEach(unmount)
        return
    }
    const el = (node as any)._vnode?.el as Element
    if (el) {
        const parent = el?.parentNode
        if (parent) parent.removeChild(el)
    }
}

export function createRenderer(options: RenderOption = defaultRenderOptions) {
    const { createElement, insert, setElementText, patchProps, createText, setText, createComment } = options

    function mountElement(node: VNode, container: Element) {
        const el = (node.el = createElement(node.type as unknown as keyof HTMLElementTagNameMap))
        if (typeof node.children === 'string') {
            setElementText(el, node.children)
        } else if (Array.isArray(node.children)) {
            node.children.forEach((child) => patch(undefined, child, el))
        }
        if (node.props) {
            for (const key in node.props) {
                patchProps(el, key, undefined, node.props[key])
            }
        }

        insert(el, container)
    }

    function patchElement(preNode: VNode, nextNode: VNode) {
        const el = (nextNode.el = preNode.el)!
        const oldProps = preNode.props ?? {}
        const newProps = nextNode.props ?? {}

        for (const key in newProps) {
            if (newProps[key] !== oldProps[key]) {
                patchProps(el, key, oldProps[key], newProps[key])
            }
        }
        for (const key in oldProps) {
            if (!(key in newProps)) {
                patchProps(el, key, oldProps[key], undefined)
            }
        }
        patchChildren(preNode, nextNode, el)
    }

    function patchChildren(preNode: VNode, nextNode: VNode, container: Element) {
        if (typeof nextNode.children === 'string') {
            if (Array.isArray(preNode.children)) {
                preNode.children.forEach((c) => unmount(c))
            }
            setElementText(container, nextNode.children)
        } else if (Array.isArray(nextNode.children)) {
            if (Array.isArray(preNode.children)) {
                const oldChildren = preNode.children!
                const newChildren = nextNode.children!

                // 用来存储寻找过程中遇到的最大索引值
                let lastIndex = 0

                for (let i = 0; i < newChildren.length; i++) {
                    const newVNode = newChildren[i]
                    for (let j = 0; j < oldChildren.length; j++) {
                        const oldVNode = oldChildren[j]
                        if (newVNode.key === oldVNode.key && newVNode.key !== undefined) {
                            patch(oldVNode, newVNode, container)
                            if (j < lastIndex) {
                                // 如果当前找到的节点在旧 children 中的索引小于最大索引值,说明该节点对应的真实 DOM 需要移动
                            } else {
                                // 如果当前找到的节点在旧 children 中的索引不小于最大索引, 更新lastIndex
                                lastIndex = j
                            }
                            break
                        }
                    }
                }
            } else {
                setElementText(container, '')
                nextNode.children.forEach((c) => patch(undefined, c, container))
            }
        } else {
            if (Array.isArray(preNode.children)) {
                preNode.children.forEach((c) => unmount(c))
            } else if (typeof preNode.children === 'string') {
                setElementText(container, '')
            }
        }
    }

    function patch(preNode: VNode | undefined, nextNode: VNode, container: Element) {
        if (preNode && preNode.type !== nextNode.type) {
            unmount(preNode)
            preNode = undefined
        }
        if (nextNode.type === 'text') {
            if (!preNode) {
                //@ts-ignore
                const el = (nextNode.el = createText(nextNode.children as string))
                insert(el, container)
            } else {
                const el = (nextNode.el = preNode.el)
                if (nextNode.children !== preNode.children) {
                    el && setText(el as unknown as Text, nextNode.children as string)
                }
            }
        } else if (nextNode.type === 'comment') {
            if (!preNode) {
                //@ts-ignore
                const el = (nextNode.el = createComment(nextNode.children as string))
                insert(el, container)
            } else {
                const el = (nextNode.el = preNode.el)
                if (nextNode.children !== preNode.children) {
                    unmount(preNode)
                    //@ts-ignore
                    const el = (nextNode.el = createComment(nextNode.children as string))
                    insert(el, container)
                }
            }
        } else if (nextNode.type === 'fragment') {
            if (!preNode) {
                ;(nextNode.children as VNode[]).forEach((c) => patch(undefined, c, container))
            } else {
                patchChildren(preNode, nextNode, container)
            }
        } else if (typeof nextNode.type === 'string') {
            if (!preNode) {
                mountElement(nextNode, container)
            } else {
                patchElement(preNode, nextNode)
            }
        } else if (typeof nextNode.type === 'object') {
            //component
        }
    }

    function render(vnode: VNode, container: Element) {
        if (vnode) {
            patch((container as any)._vnode, vnode, container)
        } else {
            if ((container as any)._vnode) {
                unmount((container as any)._vnode)
            }
        }
        ;(container as any)._vnode = vnode
    }

    return {
        render,
    }
}

