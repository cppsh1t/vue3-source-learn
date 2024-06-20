export function initRenderContainer() {
    let root = document.querySelector('#app')
    if (root !== undefined && root !== null) return root 
    root = document.createElement('div')
    root.setAttribute('id', 'app')
    document.body.appendChild(root)
    return root
}