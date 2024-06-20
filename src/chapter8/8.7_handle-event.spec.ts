import { expect, test } from 'vitest'
import { initRenderContainer } from '../utils/util'
import { createRenderer } from './8.7_handle-event'
import { VNode } from '../utils/type'

test('event-call-test', () => {
    const appContainer = initRenderContainer()
    const { render } = createRenderer()
    let result = ''
    const vnode: VNode = {
        type: 'button',
        props: {
            id: 'foo',
            $onClick: () => {
                result = 'holy shit'
            },
        },
        children: 'click button',
    }

    render(vnode, appContainer)
    document.querySelector('#foo')?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
    expect(result).toEqual('holy shit')
})
