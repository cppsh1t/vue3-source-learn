import { expect, test } from 'vitest'
import { VNode, createRenderer } from './8.1_mount-and-attribute'
import { initRenderContainer } from '../utils/util'

test('attribute-test', () => {
    const appContainer = initRenderContainer()
    const vnode: VNode = {
        type: 'div',
        props: {
            id: 'foo',
        },
        children: [
            {
                type: 'p',
                children: 'hello',
            },
        ],
    }

    const { render } = createRenderer()
    render(vnode, appContainer)

    const fooEle = document.querySelector('#foo')
    expect(fooEle).not.toBeNull()
})

test('mount-test', () => {
    const appContainer = initRenderContainer()
    const vnode: VNode = {
        type: 'div',
        props: {
            id: 'foo',
        },
        children: [
            {
                type: 'p',
                children: 'hello',
            },
        ],
    }

    const { render } = createRenderer()
    render(vnode, appContainer)

    const fooEle = document.querySelector('#foo')!
    const childEle = document.children[0]
    expect(childEle).not.toBeNull()
    const text = childEle.textContent
    expect(text).toEqual('hello')
})
