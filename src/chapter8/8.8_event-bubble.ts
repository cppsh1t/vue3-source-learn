import { effect, ref } from '../chapter6/6.3_unwrapper-ref'
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
        //@ts-ignore
        insert: function (el: Element, parent: Element, anchor?: any): void {
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
    const el = (node as any)._vnode.el as Element
    const parent = el.parentNode
    if (parent) parent.removeChild(el)
}

export function createRenderer(options: RenderOption = defaultRenderOptions) {
    const { createElement, insert, setElementText, patchProps } = options

    function mountElement(node: VNode, container: Element) {
        //@ts-ignore
        const el = (node.el = createElement(node.type))
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
                patchProps(el, key, oldProps[key], null)
            }
        }
    }

    function patch(n1: VNode | undefined, n2: VNode, container: Element) {
        if (n1 && n1.type !== n2.type) {
            unmount(n1)
            n1 = undefined
        }
        if (typeof n2.type === 'string') {
            if (!n1) {
                mountElement(n2, container)
            } else {
                patchElement(n1, n2)
            }
        } else if (typeof n2.type === 'object') {
            //component
        } else if (n2.type === 'xxx') {
            //other types
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


export const rendererItem: RendererItem = {
    name: "8.8_event-bubble",
    doRender: function () {
        const appContainer = initRenderContainer()
        const { render } = createRenderer()
        const bol = ref(false)
        let num = 0

        effect(() => {
            const vnode: VNode = {
                type: 'div',
                props: bol.value
                    ? {
                          $onClick: () => {
                            num++
                              alert('父元素 clicked')
                          },
                      }
                    : {},
                children: [
                    {
                        type: 'p',
                        props: {
                            $onClick: () => {
                                bol.value = true
                            },
                        },
                        children: 'text',
                    },
                ],
            }
            render(vnode, appContainer)
        })
    }
}