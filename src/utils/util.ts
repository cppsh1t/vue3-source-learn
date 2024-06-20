import { ClassItem } from './type'

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



export function processClass(classItem: ClassItem) {
    if (typeof classItem === 'string') {
        return classItem
    }
    else if (!Array.isArray(classItem)) {
        let str = ''
        for (const key in classItem) {
            if (!classItem[key]) continue
            str = str === '' ? key : `${str} ${key}`
        }
        return str
    } else {
        let str = ''
        for(const item of classItem) {
            const childStr = processClass(item)
            str = str === '' ? childStr : `${str} ${childStr}`
        }
        return str
    }
}