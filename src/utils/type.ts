type VnodeProps = Record<string, any>
export type VNode = {
    type: keyof HTMLElementTagNameMap
    props?: VnodeProps
    children?: string | VNode[]
    el?: Element 
}

export type RenderOption = {
    /**
     * get html element by tag
     * @param tag tag of html element
     * @returns html element
     */
    createElement: (tag: keyof HTMLElementTagNameMap) => Element

    /**
     * set text of html element
     * @param el the html element which you want to set Text
     * @param text the text you want to set
     */
    setElementText: (el: Element, text: string) => void

    /**
     * insert a element into a element
     * @param el the element you want to insert
     * @param parent where the insert element will be
     * @param anchor just anchor
     */
    insert: (el: Element, parent: Element, anchor?: any) => void

    patchProps: (el: Element, key: string, preValue: string | undefined, nextValue: string) => void
}

export type ClassItem = string | Record<string, boolean> | Array<ClassItem>