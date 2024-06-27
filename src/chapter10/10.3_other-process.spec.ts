import { expect, test } from "vitest"
import { initRenderContainer } from "../utils/util"
import { createRenderer } from "./10.3_other-process"
import { VNode } from "../utils/type"
import { sleep } from "radash"

test('move-element-test', async () => {
    const appContainer = initRenderContainer()
    const { render } = createRenderer()
    const oldVNode: VNode = {
        type: 'div',
        props: {
            id: 'foo'
        },
        children: [
            { type: 'p', children: '1 to 3', key: 1, props: { id: 'ele1' } },
            { type: 'p', children: '2 to 1', key: 2, props: { id: 'ele2' } },
            { type: 'p', children: '3 to 4', key: 3, props: { id: 'ele3' } },
            { type: 'p', children: '4 to 2', key: 4, props: { id: 'ele4' } },
        ],
    }

    const newVNode: VNode = {
        type: 'div',
        props: {
            id: 'foo'
        },
        children: [
            { type: 'p', children: '2 to 1', key: 2, props: { id: 'ele2' } },
            { type: 'p', children: '4 to 2', key: 4, props: { id: 'ele4' } },
            { type: 'p', children: '1 to 3', key: 1, props: { id: 'ele1' } },
            { type: 'p', children: '3 to 4', key: 3, props: { id: 'ele3' } },
        ],
    }

    render(oldVNode, appContainer)
    expect(document.querySelector('#foo')?.children[0].id).toEqual('ele1')
    expect(document.querySelector('#foo')?.children[1].id).toEqual('ele2')
    expect(document.querySelector('#foo')?.children[2].id).toEqual('ele3')
    expect(document.querySelector('#foo')?.children[3].id).toEqual('ele4')
    await sleep(300)
    render(newVNode, appContainer)
    expect(document.querySelector('#foo')?.children[0].id).toEqual('ele2')
    expect(document.querySelector('#foo')?.children[1].id).toEqual('ele4')
    expect(document.querySelector('#foo')?.children[2].id).toEqual('ele1')
    expect(document.querySelector('#foo')?.children[3].id).toEqual('ele3')
})
