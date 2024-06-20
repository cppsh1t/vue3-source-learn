import { expect, test } from 'vitest'
import { initRenderContainer, processClass } from '../utils/util'
import { createRenderer } from './8.4_process-class'
import { VNode } from '../utils/type'

test('process-class-test', () => {
    const appContainer = initRenderContainer()
    const { render } = createRenderer()
    const vnode: VNode = {
        type: 'div',
        props: {
            id: 'foo',
            class: 'foo1 foo2',
        },
        children: [
            {
                type: 'div',
                props: {
                    id: 'bar',
                    class: processClass({ bar1: false, bar2: true }),
                },
            },
            {
                type: 'div',
                props: {
                    id: 'baz',
                    class: processClass(['baz1', { baz2: false, baz3: true }])
                },
            },
        ],
    }

    render(vnode, appContainer)
    const fooEle = document.querySelector('#foo')
    expect(fooEle?.className).toEqual('foo1 foo2')
    const barEle = document.querySelector('#bar')
    expect(barEle?.className).toEqual('bar2')
    const bazEle = document.querySelector('#baz')
    expect(bazEle?.className).toEqual('baz1 baz3')
})
