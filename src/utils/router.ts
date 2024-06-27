export type RendererItem = {
    name: string
    doRender: () => void
}

const router: (RendererItem | Promise<RendererItem>)[] = [
    import('./../chapter7/7.3_custom-renderer').then((r) => r.rendererItem),
    import('./../chapter8/8.1_mount-and-attribute').then((r) => r.rendererItem),
    import('./../chapter8/8.3_set-attribute').then((r) => r.rendererItem),
    import('./../chapter8/8.7_handle-event').then((r) => r.rendererItem),
    import('./../chapter8/8.8_event-bubble').then((r) => r.rendererItem),
    import('./../chapter8/8.10_comment-and-text').then((r) => r.rendererItem),
    import('./../chapter8/8.11_fragment').then((r) => r.rendererItem),
    import('./../chapter9/9.2_dom-reuse').then((r) => r.rendererItem),
    import('./../chapter9/9.4_move-element').then((r) => r.rendererItem),
    import('./../chapter9/9.5_new-element').then((r) => r.rendererItem),
]

export async function initRouter() {
    let homeEle = document.querySelector('#home')
    if (!homeEle) {
        homeEle = document.createElement('div')
        homeEle.id = 'home'
    }
    for (const item of router) {
        const btn = document.createElement('button')
        if (Object.prototype.toString.call(item) === '[object Promise]') {
            
        }
        const rendererItem = Object.prototype.toString.call(item) === '[object Promise]' ? (await (await item as unknown as Promise<RendererItem>)) : item as RendererItem
        btn.textContent = rendererItem.name
        btn.className = 'item'
        btn.addEventListener('click', rendererItem.doRender)
        homeEle.appendChild(btn)
    }
}
