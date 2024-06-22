import { expect, test } from "vitest"
import { initRenderContainer } from "../utils/util"
import { createRenderer } from "./8.10_comment-and-text"
import { VNode } from "../utils/type"

test('text-node-test', () => {
    const appContainer = initRenderContainer()
    const { render } = createRenderer()
    const vnode: VNode = {
        type: 'div',
        children: [
            {
                type: 'text',
                children: 'just text'
            },
            {
                type: 'comment',
                children: 'cant see me'
            }
        ],
    }
    render(vnode, appContainer)
    expect(appContainer.textContent).toEqual('just text')
    expect(appContainer.children[0].childNodes[0].nodeValue).toEqual('just text')
    expect(appContainer.children[0].childNodes[1].nodeValue).toEqual('cant see me')
})