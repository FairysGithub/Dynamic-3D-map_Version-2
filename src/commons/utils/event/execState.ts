import { storeToRefs } from 'pinia'
import { usePageStore } from '../../stores/pageStore'

const pageStore = usePageStore()
const { currentPage } = storeToRefs(pageStore)

function getNextElement(arr: string[], target: string) {
    // 首先检查数组和目标元素是否为有效
    if (!Array.isArray(arr) || !arr.length || typeof target !== 'string') {
        return null // 如果数组无效或目标不是字符串，则返回null
    }

    // 查找目标元素的索引
    const index = arr.indexOf(target)

    // 如果找不到目标元素，返回null
    if (index === -1) {
        return null
    }

    // 计算下一个元素的索引
    // 如果当前是最后一个元素，则从头开始
    const nextIndex = (index + 1) % arr.length

    // 返回下一个元素
    return arr[nextIndex]
}

export const execEventState = (event: any) => {
    console.log('执行 切换状态', event)
    try {
        event.stateAction.stateList.forEach((state, index) => {
            const layerId = state.split('[layerId-stateId]')[0]
            const stateId = state.split('[layerId-stateId]')[1]
            const result = currentPage.value.states.find(item => item.id === layerId)

            /** 设置状态 */
            if (result && result.states) {
                if (stateId === 'default') {
                    result.useState = ''
                } else {
                    result.useState = stateId
                }

                /** 设置下一次状态 */
                if (event.stateAction.toggle) {
                    const stateIds = ['default', ...result.states.map(item => item.stateId)]
                    const nextState = getNextElement(stateIds, stateId)
                    if (nextState) {
                        event.stateAction.stateList[index] = `${layerId}[layerId-stateId]${nextState}`
                    }
                }
            }

            /** 过度效果 */
            const layer = document.getElementById(layerId) as any
            const renderer = (parent: Element) => {
                if (parent && parent.children) {
                    for (let i = 0; i < parent.children.length; i++) {
                        const child = parent.children[i] as any

                        if (child._transitionTimer) {
                            clearTimeout(child._transitionTimer)
                        }

                        if (event.stateAction.speed !== '') {
                            child.style.transition = `all ${event.stateAction.duration}ms ${event.stateAction.speed} ${event.stateAction.delay}ms`

                            /** 过渡完成后移除过渡 */
                            child._transitionTimer = setTimeout(() => {
                                child.style.transition = ''
                            }, (event.stateAction.duration + event.stateAction.delay))
                        }

                        renderer(child)
                    }
                }
            }
            if (layer._transitionTimer) {
                clearTimeout(layer._transitionTimer)
            }
            if (event.stateAction.speed !== '') {
                layer.style.transition = `all ${event.stateAction.duration}ms ${event.stateAction.speed} ${event.stateAction.delay}ms`

                /** 过渡完成后移除过渡 */
                layer._transitionTimer = setTimeout(() => {
                    layer.style.transition = ''
                }, (event.stateAction.duration + event.stateAction.delay))
            }
            renderer(layer)
        })
    } catch (error) {
        console.error('执行 切换状态错误', error, event)
    }
}