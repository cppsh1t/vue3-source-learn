import { sleep } from 'radash'
import { RendererItem } from '../utils/router'
import { RenderOption, VNode } from '../utils/type'
import { initRenderContainer } from '../utils/util'

export function getDefaultRenderOption(): RenderOption {
    return {
        createElement: function (tag: keyof HTMLElementTagNameMap): Element {
            return document.createElement(tag)
        },
        setElementText: function (el: Element, text: string): void {
            el.textContent = text
        },
        insert: function (el: Element | Text | Comment, parent: Element, anchor?: any): void {
            if (anchor !== undefined) {
                parent.insertBefore(el, anchor)
            } else {
                parent.appendChild(el)
            }
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
    const el = node.el as Element | Text | Comment
    if (el) {
        const parent = el?.parentNode
        if (parent) parent.removeChild(el)
    }
}

export function createRenderer(options: RenderOption = defaultRenderOptions) {
    const { createElement, insert, setElementText, patchProps, createText, setText, createComment } = options

    function mountElement(node: VNode, container: Element, anchor?: Element) {
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

        insert(el, container, anchor)
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
                patchKeyedChildren(preNode, nextNode, container)
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

    function patchKeyedChildren(preNode: VNode, nextNode: VNode, container: Element) {
        const oldChildren = preNode.children as VNode[]
        const newChildren = nextNode.children as VNode[]
        let oldStartIndex = 0
        let oldEndIndex = oldChildren.length - 1
        let newStartIndex = 0
        let newEndIndex = newChildren.length - 1
        let oldStartVNode = oldChildren[oldStartIndex]
        let oldEndVNode = oldChildren[oldEndIndex]
        let newStartVNode = newChildren[newStartIndex]
        let newEndVNode = newChildren[newEndIndex]

        while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
            if (!oldStartVNode) {
                oldStartVNode = oldChildren[++oldStartIndex]
            } else if (!oldEndVNode) {
                oldEndVNode = newChildren[--oldEndIndex]
            } else if (oldStartVNode.key === newStartVNode.key) {
                patch(oldStartVNode, newStartVNode, container)
                // 更新相关索引，指向下一个位置
                oldStartVNode = oldChildren[++oldStartIndex]
                newStartVNode = newChildren[++newStartIndex]
            } else if (oldEndVNode.key === newEndVNode.key) {
                // 节点在新的顺序中仍然处于尾部，不需要移动，但仍需打补丁
                patch(oldEndVNode, newEndVNode, container)
                // 更新索引和头尾部节点变量
                oldEndVNode = oldChildren[--oldEndIndex]
                newEndVNode = newChildren[--newEndIndex]
            } else if (oldStartVNode.key === newEndVNode.key) {
                patch(oldStartVNode, newEndVNode, container)
                insert(oldStartVNode.el!, container, oldEndVNode.el!.nextSibling)
                oldStartVNode = oldChildren[++oldStartIndex]
                newEndVNode = newChildren[--newEndIndex]
            } else if (oldEndVNode.key === newStartVNode.key) {
                patch(oldEndVNode, newStartVNode, container)
                // oldEndVNode.el 移动到 oldStartVNode.el 前面
                insert(oldEndVNode.el!, container, oldStartVNode.el!)
                // 移动 DOM 完成后，更新索引值，并指向下一个位置
                oldEndVNode = oldChildren[--oldEndIndex]
                newStartVNode = newChildren[++newStartIndex]
            } else {
                // 遍历旧的一组子节点，试图寻找与 newStartVNode 拥有相同 key 值的节点
                // idxInOld 就是新的一组子节点的头部节点在旧的一组子节点中的索引
                const idxInOld = oldChildren.findIndex((node) => node.key === newStartVNode.key)
                if (idxInOld <= 0) continue
                // idxInOld 位置对应的 vnode 就是需要移动的节点
                const vnodeToMove = oldChildren[idxInOld]
                // 不要忘记除移动操作外还应该打补丁
                patch(vnodeToMove, newStartVNode, container)
                // 将 vnodeToMove.el 移动到头部节点 oldStartVNode.el 之前，因此使用后者作为锚点
                insert(vnodeToMove.el!, container, oldStartVNode.el)
                // 由于位置 idxInOld 处的节点所对应的真实 DOM 已经移动到了别处，因此将其设置为 undefined
                oldChildren[idxInOld] = undefined as unknown as VNode
                // 最后更新 newStartIdx 到下一个位置
                newStartVNode = newChildren[++newStartIndex]
            }
        }
    }

    function patch(preNode: VNode | undefined, nextNode: VNode, container: Element, anchor?: Element) {
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
                mountElement(nextNode, container, anchor)
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
