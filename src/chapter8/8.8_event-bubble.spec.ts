import { expect, test } from 'vitest'
import { initRenderContainer } from '../utils/util'
import { createRenderer } from './8.8_event-bubble'
import { ref, effect } from '../chapter6/6.3_unwrapper-ref'
import { VNode } from '../utils/type'

test('bind-event-test', () => {
    const appContainer = initRenderContainer()
    const { render } = createRenderer()
    const bol = ref(false)
    let num = 0

    effect(() => {
        const vnode: VNode = {
            type: 'div',
            props: bol.value
                ? {
                      $onClick: () => {
                          num++
                          console.log('父元素 clicked')
                      },
                  }
                : {},
            children: [
                {
                    type: 'p',
                    props: {
                        $onClick: () => {
                            bol.value = true
                        },
                        id: 'foo',
                    },
                    children: 'text',
                },
            ],
        }
        render(vnode, appContainer)
    })
    const foo = document.querySelector('#foo')
    foo?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
    foo?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
    expect(num).toEqual(1)
})
