import { type VNode, createRenderer } from './chapter7/7.3_custom-renderer'

const vnode: VNode = {
    type: 'h1',
    children: '7.3_custom-renderer hello',
}

const { render } = createRenderer()

const appContainer = document.querySelector('#app')

if (appContainer instanceof HTMLElement) {
    render(vnode, appContainer)
} else {
    alert('render error')
}


