import { RenderOption, VNode } from "./type"
import { initRenderContainer } from "./util"

type Item = {
    name: string
    node: VNode
    renderFunc: (vnode: VNode) => void
}


function generateRenderFunc(func: (options?: RenderOption)=> {
    render: (vnode: VNode, container: Element) => void;
}) {
    return (vnode: VNode) => {
        const appContainer = initRenderContainer()
        console.log(appContainer.children.length)
        const { render } = func()
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
        renderFunc: generateRenderFunc((await (import('./../chapter7/7.3_custom-renderer'))).createRenderer)
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
        renderFunc: generateRenderFunc((await (import('./../chapter8/8.1_mount-and-attribute'))).createRenderer)
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