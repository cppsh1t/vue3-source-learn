import { expect, test } from "vitest"
import { initRenderContainer } from "../utils/util"
import { createRenderer } from "./8.11_fragment"
import { VNode } from "../utils/type"

test('fragment-test', () => {
    const appContainer = initRenderContainer()
    const { render } = createRenderer()
    const vnode: VNode = {
        type: 'fragment',
        children: [
            {
                type: 'li',
                children: '1'
            },
            {
                type: 'li',
                children: '2'
            },
            {
                type: 'li',
                children: '3'
            }
        ],
    }
    render(vnode, appContainer)

    const children = [...appContainer.children].map(item => item.textContent)
    expect(children).toEqual(['1', '2', '3'])
})