export function initRenderContainer() {
    if (document.querySelector('#app')) return
    const root = document.createElement('div')
    root.setAttribute('id', 'app')
    document.body.appendChild(root)
}