import { RenderOption, VNode } from "./type"
import { initRenderContainer } from "./util"

type Item = {
    name: string
    node: VNode
    renderFunc: (vnode: VNode) => void
}

type RenderPromise = Promise<(options?: RenderOption)=> {
    render: (vnode: VNode, container: Element) => void;
}>

function generateRenderFunc(promise: RenderPromise) {
    return async (vnode: VNode) => {
        const appContainer = initRenderContainer()
        console.log(appContainer.children.length)
        const { render } = (await promise)()
        render(vnode, appContainer)
    }
}

function doRender(item: Item) {
    item.renderFunc(item.node)
}

const router: Item[] = [
    {
        name: '7.3_custom-renderer',
        node: {
            type: 'h1',
            children: '7.3_custom-renderer hello',
        },
        //@ts-ignore
        renderFunc: generateRenderFunc((import('./../chapter7/7.3_custom-renderer')).then(r => r.createRenderer))
    },
    {
        name: '8.1_mount-and-attribute',
        node: {
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
        },
        renderFunc: generateRenderFunc( (import('./../chapter8/8.1_mount-and-attribute')).then(r => r.createRenderer))
    }
]

export function initRouter() {
    let homeEle = document.querySelector('#home')
    if (!homeEle) {
        homeEle = document.createElement('div')
        homeEle.id = 'home'
    }
    for (const item of router) {
        const btn = document.createElement('button')
        btn.textContent = item.name
        btn.className = 'item'
        btn.addEventListener('click', () => doRender(item))
        homeEle.appendChild(btn)
    }
}