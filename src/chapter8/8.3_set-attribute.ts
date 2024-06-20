import { RenderOption, VNode } from '../utils/type'

export function getDefaultRenderOption(): RenderOption {
    return {
        createElement: function (tag: keyof HTMLElementTagNameMap): Element {
            return document.createElement(tag)
        },
        setElementText: function (el: Element, text: string): void {
            el.textContent = text
        },
        insert: function (el: Element, parent: Element, anchor?: any): void {
            parent.appendChild(el)
        },
        patchProps: function (el: Element, key: string, preValue: string | undefined, nextValue: string): void {
            const castedEl = el as Element & Record<string, any>
            if (shouldSetAsProps(el, key, nextValue)) {
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

export function createRenderer(options: RenderOption = defaultRenderOptions) {
    const { createElement, insert, setElementText, patchProps } = options

    function mountElement(node: VNode, container: Element) {
        const el = createElement(node.type)
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

    function patch(n1: VNode | undefined, n2: VNode, container: Element) {
        if (!n1) {
            mountElement(n2, container)
        } else {
            // patch
        }
    }

    function render(vnode: VNode, container: Element) {
        if (vnode) {
            //@ts-ignore
            patch(container['_vnode'], vnode, container)
        } else {
            //@ts-ignore
            if (container['_vnode']) {
                container.innerHTML = ''
            }
        }
        //@ts-ignore
        container['_vnode'] = vnode
    }

    return {
        render,
    }
}
