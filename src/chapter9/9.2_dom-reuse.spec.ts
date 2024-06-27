import { expect, test } from 'vitest'
import { initRenderContainer } from '../utils/util'
import { createRenderer } from './9.2_dom-reuse'
import { VNode } from '../utils/type'
import { sleep } from 'radash'

test('update-children-test', async () => {
    const appContainer = initRenderContainer()
    const { render } = createRenderer()
    const oldVNode: VNode = {
        type: 'div',
        props: {
            id: 'old',
        },
        children: [
            { type: 'p', children: '1', key: 1 },
            { type: 'p', children: '2', key: 2 },
            { type: 'p', children: 'hello', key: 3, props: { id: 'text' } },
        ],
    }

    const newVNode: VNode = {
        type: 'div',
        props: {
            id: 'new',
        },
        children: [
            { type: 'p', children: 'world', key: 3, props: { id: 'text' } },
            { type: 'p', children: '1', key: 1 },
            { type: 'p', children: '2', key: 2 },
        ],
    }

    render(oldVNode, appContainer)
    expect(document.querySelector('#text')?.textContent).toEqual('hello')
    await sleep(300)
    render(newVNode, appContainer)
    expect(document.querySelector('#old')).toBeNull()
    expect(document.querySelector('#text')?.textContent).toEqual('world')

})
