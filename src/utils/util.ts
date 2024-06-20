export function initRenderContainer() {
    let root = document.querySelector('#app')
    if (root !== undefined && root !== null) {
        root.innerHTML = ''
        while (root.attributes.length > 0) {
            root.removeAttribute(root.attributes[0].name);
        }
        //@ts-ignore
        root["_vnode"] = undefined
        root.id = 'app'
        return root
    }
    root = document.createElement('div')
    root.setAttribute('id', 'app')
    document.body.appendChild(root)
    return root
}