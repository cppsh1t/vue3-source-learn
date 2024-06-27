type VnodeProps = Record<string, any>

export type VNode = {
    type: keyof HTMLElementTagNameMap | 'text' | 'comment' | 'fragment'
    props?: VnodeProps
    children?: string | VNode[]
    key?: number
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
    insert: (el: Element | Text | Comment, parent: Element, anchor?: any) => void

    /**
     * patch props for element
     * @param el the element will be patched
     * @param key the key of patch
     * @param preValue
     * @param nextValue
     */
    patchProps: (el: Element, key: string, preValue: any | undefined, nextValue: any) => void

    /**
     * create a TextNode
     * @param text the text of TextNode
     * @returns TextNode
     */
    createText: (text: string) => Text

    /**
     * update the text of TextNode
     * @param el TextNode which will be set value
     * @param text the text you want to set
     */
    setText: (el: Text, text: string) => void

    /**
     * create a CommentNode
     * @param text the text of CommentNode
     * @returns CommentNode
     */
    createComment: (text: string) => Comment
}

export type ClassItem = string | Record<string, boolean> | Array<ClassItem>
