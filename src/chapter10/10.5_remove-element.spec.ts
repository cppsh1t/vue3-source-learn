import { expect, test } from 'vitest'
import { initRenderContainer } from '../utils/util'
import { createRenderer } from './10.5_remove-element'
import { VNode } from '../utils/type'
import { sleep } from 'radash'

test('remove-element-test', async () => {
    const appContainer = initRenderContainer()
    const { render } = createRenderer()
    const oldVNode: VNode = {
        type: 'div',
        props: {
            id: 'foo',
        },
        children: [
            { type: 'p', children: '1', key: 1, props: { id: 'ele1' } },
            { type: 'p', children: '2', key: 2, props: { id: 'ele2' } },
            { type: 'p', children: '3', key: 3, props: { id: 'ele3' } },
        ],
    }

    const newVNode: VNode = {
        type: 'div',
        props: {
            id: 'foo',
        },
        children: [
            { type: 'p', children: '3', key: 3, props: { id: 'ele3' } },
            { type: 'p', children: '1', key: 1, props: { id: 'ele1' } },
        ],
    }

    render(oldVNode, appContainer)
    expect(document.querySelector('#foo')?.children[0].id).toEqual('ele1')
    expect(document.querySelector('#foo')?.children[1].id).toEqual('ele2')
    expect(document.querySelector('#foo')?.children[2].id).toEqual('ele3')
    await sleep(300)
    render(newVNode, appContainer)
    expect(document.querySelector('#foo')?.children[0].id).toEqual('ele3')
    expect(document.querySelector('#foo')?.children[1].id).toEqual('ele1')
    expect(document.querySelector('#foo')?.children).toHaveLength(2)
})
