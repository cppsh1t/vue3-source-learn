import { expect, test } from 'vitest'
import { type VNode, createRenderer } from './7.3_custom-renderer'
import { initRenderContainer } from '../utils/util'

test('custom-renderer-test', () => {
    const appContainer = initRenderContainer()
    const vnode: VNode = {
        type: 'h1',
        children: '7.3_custom-renderer hello',
    }

    const { render } = createRenderer()

    render(vnode, appContainer)

    const finalText = document.querySelector('#app')?.querySelector('h1')?.textContent
    expect(finalText).toEqual('7.3_custom-renderer hello')
})
