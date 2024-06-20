import { expect, test } from 'vitest'
import { initRenderContainer } from '../utils/util'
import { createRenderer } from './8.3_set-attribute'
import { VNode } from '../utils/type'

test('set-attribute-test', () => {
    const appContainer = initRenderContainer()
    const { render } = createRenderer()

    const vnode: VNode = {
        type: 'div',
        children: [
            {
                type: 'button',
                props: {
                    disabled: '',
                    id: 'btn1',
                },
                children: 'a button',
            },
            {
                type: 'button',
                props: {
                    disabled: false,
                    id: 'btn2',
                },
                children: 'a button',
            },
        ],
    }
    render(vnode, appContainer)
    const btn1 = appContainer.querySelector('#btn1') as HTMLButtonElement
    const btn2 = appContainer.querySelector('#btn2') as HTMLButtonElement
    expect(btn1).not.toBeNull()
    expect(btn2).not.toBeNull()
    expect(btn1.disabled).toEqual(true)
    expect(btn2.disabled).toEqual(false)
})
