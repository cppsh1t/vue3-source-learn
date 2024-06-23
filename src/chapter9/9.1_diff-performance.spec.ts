import { expect, test } from 'vitest'
import { initRenderContainer } from '../utils/util'
import { createRenderer } from './9.1_diff-performance'
import { VNode } from '../utils/type'

test('update-children-test', () => {
    const appContainer = initRenderContainer()
    const { render } = createRenderer()
    const vnode_c: VNode = {
        type: 'div',
        props: {
            id: 'foo',
        },
        children: [
            {
                type: 'div',
                props: {
                    id: 'child1',
                },
            },
            {
                type: 'div',
                props: {
                    id: 'child2',
                },
            },
        ],
    }
    const vnode_e: VNode = {
        type: 'div',
        props: {
            id: 'foo',
        },
    }
    const vnode_t: VNode = {
        type: 'div',
        props: {
            id: 'foo',
        },
        children: 'just text',
    }

    render(vnode_c, appContainer)
    expect(document.querySelector('#child1')).not.toBeNull()
    expect(document.querySelector('#child2')).not.toBeNull()
    render(vnode_t, appContainer)
    expect(document.querySelector('#child1')).toBeNull()
    expect(document.querySelector('#child2')).toBeNull()
    expect(document.querySelector('#foo')?.textContent).toEqual('just text')
    render(vnode_e, appContainer)
    expect(document.querySelector('#foo')?.children).toHaveLength(0)
    render(vnode_t, appContainer)
    expect(document.querySelector('#foo')?.textContent).toEqual('just text')
    render(vnode_c, appContainer)
    expect(document.querySelector('#foo')?.textContent).toEqual('')
    expect(document.querySelector('#child1')).not.toBeNull()
    expect(document.querySelector('#child2')).not.toBeNull()

})
