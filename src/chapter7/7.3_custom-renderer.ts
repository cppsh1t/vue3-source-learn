export type VNode = {
    type: keyof HTMLElementTagNameMap
    children: string | unknown[]
}

export type RenderOption = {
    /**
     * get html element by tag
     * @param tag tag of html element
     * @returns html element
     */
    createElement: (tag: keyof HTMLElementTagNameMap) => Element

    /**
     * set text of html element
     * @param el the html element which you want to set Text
     * @param text the text you want to set
     */
    setElementText: (el: Element, text: string) => void

    /**
     * insert a element into a element
     * @param el the element you want to insert
     * @param parent where the insert element will be
     * @param anchor just anchor
     */
    insert: (el: Element, parent: Element, anchor?: any) => void
}

const defaultRenderOptions: RenderOption = {
    createElement: function (tag: keyof HTMLElementTagNameMap): Element {
        return document.createElement(tag)
    },
    setElementText: function (el: Element, text: string): void {
        el.textContent = text
    },
    insert: function (el: Element, parent: Element, anchor?: any): void {
        parent.innerHTML = ''
        parent.appendChild(el)
    },
}

export function getDefaultRenderOption(): RenderOption {
    return {
        createElement: function (tag: keyof HTMLElementTagNameMap): Element {
            return document.createElement(tag)
        },
        setElementText: function (el: Element, text: string): void {
            el.textContent = text
        },
        insert: function (el: Element, parent: Element, anchor?: any): void {
            parent.innerHTML = ''
            parent.appendChild(el)
        },
    }
}

export function createRenderer(options: RenderOption = defaultRenderOptions) {
    const { createElement, insert, setElementText } = options

    function mountElement(node: VNode, container: Element) {
        const el = createElement(node.type)
        if (typeof node.children === 'string') {
            setElementText(el, node.children)
        }
        insert(el, container)
    }

    function patch(n1: VNode, n2: VNode, container: Element) {
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
