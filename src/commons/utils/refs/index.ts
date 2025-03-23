// @ts-ignore
import { isArray } from "lodash"
window.SHJComponentRefs = []
export const registerComponentRef = (layerId: string) => {
    return (el: any) => {
        if (window.SHJComponentRefs && isArray(window.SHJComponentRefs) && el && layerId) {
            const existingRef = window.SHJComponentRefs.find((item: { layerId: string }) => item.layerId === layerId)
            if (!existingRef) {
                window.SHJComponentRefs.push({
                    layerId,
                    ref: el
                })
            } else {
                existingRef.ref = el
            }
        }
    }
}