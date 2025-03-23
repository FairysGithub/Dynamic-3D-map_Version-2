/* eslint-disable */
import { cloneDeep,isArray } from 'lodash'
import { useFullscreen } from '@vueuse/core'

import { execUpdateVariable } from './execUpdateVariable'
import { execEventUe } from './execEventUe'
import { exeEventUnity } from './exeEventUnity'
import { execEventState } from './execState'
import { execEventSendApi } from './execSendApi'
import { execEventVisible } from './execVisible'
import { execSwitchView }    from './execSwitchView'
import { execEventPage } from './execEventPage'


const { enter, exit, toggle } = useFullscreen()

/** 解析事件 */
export const parseEvents = (events: any[], type: string, params: any) => {
    try {
        if (isArray(events) && events.length > 0) {
            events.forEach(item => {
                if (item.eventType === type) {
                    setTimeout(() => {
                        /** 1. 过滤事件返回值 */
                        let newParams = cloneDeep(params)
                        if (item.filterCode) {
                            try {
                                const codeStr = `
                                    ${item.filterCode}
                        
                                    // 在这里调用 filter 函数，并传递 data 参数
                                    return filter(data);
                                `
                                const dynamicFunction = new Function('data', codeStr)
                                newParams = dynamicFunction(params)
                            } catch (error: any) {
                                console.log('错误：过滤器语法错误')
                            }
                        }

                        /** 2. 条件逻辑判断 */
                        let flag = true
                        if (item.condition && isArray(item.condition.list) && item.condition.list.length > 0) {
                            for (let index = 0; index < item.condition.list.length; index++) {
                                const condition = item.condition.list[index]
                                if (condition.type === 'field') {
                                    try {
                                        if (condition.conditionName && newParams && newParams[condition.conditionName] !== undefined) {
                                            switch (condition.conditionExpression) {
                                                case 'eq':
                                                    flag = newParams[condition.conditionName].toString() === (condition.conditionValue || '').toString()
                                                    break
                                                case 'neq':
                                                    flag = newParams[condition.conditionName] !== condition.conditionValue
                                                    break
                                                case 'lt':
                                                    flag = newParams[condition.conditionName] < Number(condition.conditionValue)
                                                    break
                                                case 'gt':
                                                    flag = newParams[condition.conditionName] > Number(condition.conditionValue)
                                                    break
                                                case 'lte':
                                                    flag = newParams[condition.conditionName] <= Number(condition.conditionValue)
                                                    break
                                                case 'gte':
                                                    flag = newParams[condition.conditionName] >= Number(condition.conditionValue)
                                                    break
                                                case 'includes':
                                                    flag = (newParams[condition.conditionName] as string).includes((condition.conditionValue) as string)
                                                    break
                                                case 'noincludes':
                                                    flag = !(newParams[condition.conditionName] as string).includes((condition.conditionValue) as string)
                                                    break
                                                default:
                                                    flag = false
                                                    break
                                            }
                                        } else {
                                            flag = false
                                        }
                                    } catch (error) {
                                        flag = false
                                    }
                                }
                                if (condition.type === 'custom') {
                                    flag = false
                                    try {
                                        const codeStr = `
                                            ${condition.customValue}
                                
                                            // 在这里调用 condition 函数，并传递 data 参数
                                            return condition(data);
                                        `
                                        // eslint-disable-next-line no-new-func
                                        const dynamicFunction = new Function('data', codeStr)
                                        flag = dynamicFunction(newParams)
                                    } catch (error: any) {
                                        flag = false
                                    }
                                }
                                if (item.condition.type === 'and' && !flag) {
                                    break
                                }
                                if (item.condition.type === 'or' && flag) {
                                    break
                                }
                            }
                            console.log('通过/未通过：', flag)
                        }

                        /** 3. 执行动作 */
                        if (flag) {
                            if (item.actions === 'page') execEventPage(item)
                            if (item.actions === 'switchView') execSwitchView(item)
                            if (item.actions === 'link') exeEventLink(item)
                            if (item.actions === 'move') exeEventMove(item)
                            if (item.actions === 'state') execEventState(item)
                            if (item.actions === 'sendApi') execEventSendApi(item)
                            if (item.actions === 'scale') exeEventScale(item)
                            if (item.actions === 'rotate') exeEventRotate(item)
                            if (item.actions === 'visibled') execEventVisible(item)
                            if (item.actions === 'updatePage') exeUpdatePage(item)
                            if (item.actions === 'invoke') exeEventInvoke(item, newParams)
                            if (item.actions === 'fullscreen') exeEventFullScreen(item)
                            if (item.actions === 'updateVariable') execUpdateVariable(item, newParams)
                            if (item.actions === 'updateWidget') exeUpdateWidget(item)
                            if (item.actions === 'ueCommonsWebscoket' || item.actions === 'ueShjExecMethod') execEventUe(item, newParams)
                            if (item.actions === 'unityWebglExecMethod' || item.actions === 'unityIframeExecMethod') exeEventUnity(item, newParams)
                            if (item.actions === 'vrSceneMethod') exeVrSceneMethod(item)
                        }
                    }, item.delay)
                }
            })
        }
    } catch (error) {
        console.error('解析事件错误', error)
    }
}

/** 执行 刷新页面 */
export const exeUpdatePage = (event: any) => {
    try {
        window.location.reload()
    } catch (error) {
        console.error('执行 刷新页面错误', error, event)
    }
}

/** 执行 跳转链接 */
export const exeEventLink = (event: any) => {
    try {
        const { linkAction } = event
        window.open(linkAction.url, linkAction.target)
    } catch (error) {
        console.error('执行 跳转链接错误', error, event)
    }
}

/** 执行 调用组件方法 */
export const exeEventInvoke = (event: any, params: any) => {
    console.log('执行 调用指定组件方法', event)
    try {
        const { invokeAction } = event
        const currentComponent = window.SHJComponentRefs.find((item: any) => item.layerId === invokeAction.targetLayerId)
        if (currentComponent) {
            currentComponent.ref[invokeAction.functionName](invokeAction.functionArgs, params)
        }
    } catch (error) {
        console.error('执行 调用指定组件方法错误', error, event)
    }
}

/** 执行 组件移动 */
export const exeEventMove = (event: any) => {
    try {
        const { moveAction } = event
        if (moveAction.layerIds && moveAction.layerIds.length > 0) {
            moveAction.layerIds.forEach(id => {
                const layer = document.getElementById(id) as any

                if (layer._transitionTimer) {
                    clearTimeout(layer._transitionTimer)
                }

                layer.style.transform = `matrix(1, 0, 0, 1, ${moveAction.x}, ${moveAction.y}) `
                layer.style.transition = `transform ${moveAction.duration}ms ${moveAction.speed} ${moveAction.delay}ms`

                /** 过渡完成后移除过渡 */
                layer._transitionTimer = setTimeout(() => {
                    layer.style.transition = ''
                }, (moveAction.duration + moveAction.delay))
            })
        }
    } catch (error) {
        console.error('执行 组件移动方法错误', error, event)
    }
}

/** 执行 组件缩放 */
export const exeEventScale = (event: any) => {
    // layerMain.style.transform = [0]=scaleX [1]=scaleY [2]=rotateX [3]=rotateY [4]=rotateZ 
    try {
        const { scaleAction } = event
        if (scaleAction.layerIds && scaleAction.layerIds.length > 0) {
            scaleAction.layerIds.forEach(id => {
                const layer = document.getElementById(id) as HTMLElement
                const layerMain = layer.children[0] as any
                const transformStr = layerMain.style.transform.split(' ')

                if (layerMain._transitionTimer) {
                    clearTimeout(layerMain._transitionTimer)
                }

                if (transformStr.length >= 5) {
                    const rotateX = transformStr[2] || ''
                    const rotateY = transformStr[3] || ''
                    const rotateZ = transformStr[4] || ''
                    layerMain.style.transform = `scaleX(${scaleAction.x / 100}) scaleY(${scaleAction.y / 100}) ${rotateX} ${rotateY} ${rotateZ}`
                } else {
                    const rotateX = transformStr[0] || ''
                    const rotateY = transformStr[1] || ''
                    const rotateZ = transformStr[2] || ''
                    layerMain.style.transform = `scaleX(${scaleAction.x / 100}) scaleY(${scaleAction.y / 100}) ${rotateX} ${rotateY} ${rotateZ}`
                }

                layerMain.style.transformOrigin = scaleAction.origin

                if (scaleAction.speed !== '') {
                    layerMain.style.transition = `transform ${scaleAction.duration}ms ${scaleAction.speed} ${scaleAction.delay}ms`

                    /** 过渡完成后移除过渡 */
                    layerMain._transitionTimer = setTimeout(() => {
                        layerMain.style.transition = ''
                    }, (scaleAction.duration + scaleAction.delay))
                }
            })
        }
    } catch (error) {
        console.error('执行 组件移动方法错误', error, event)
    }
}

/** 执行 组件旋转 */
export const exeEventRotate = (event: any) => {
    // layerMain.style.transform = [0]=scaleX [1]=scaleY [2]=rotateX [3]=rotateY [4]=rotateZ 
    try {
        const { rotateAction } = event
        if (rotateAction.layerIds && rotateAction.layerIds.length > 0) {
            rotateAction.layerIds.forEach(id => {
                const layer = document.getElementById(id) as HTMLElement
                const layerMain = layer.children[0] as any

                if (layerMain._transitionTimer) {
                    clearTimeout(layerMain._transitionTimer)
                }

                const transformStr = layerMain.style.transform.split(' ')
                const scaleX = transformStr[0] || ''
                const scaleY = transformStr[1] || ''
                layerMain.style.transform = `${scaleX} ${scaleY} rotateX(${rotateAction.x}deg) rotateY(${rotateAction.y}deg) rotateZ(${rotateAction.z}deg)`
                if (rotateAction.x > 0 || rotateAction.y > 0 || rotateAction.z > 0) {
                    layer.style.perspective = rotateAction.perspective + 'px';
                }
                if (rotateAction.speed !== '') {
                    layerMain.style.transition = `transform ${rotateAction.duration}ms ${rotateAction.speed} ${rotateAction.delay}ms`

                    /** 过渡完成后移除过渡 */
                    layerMain._transitionTimer = setTimeout(() => {
                        layerMain.style.transition = ''
                    }, (rotateAction.duration + rotateAction.delay))
                }
            })
        }

    } catch (error) {

    }
}

/** 执行 全景场景方法 */
export const exeVrSceneMethod = (event: any) => {
    console.log('执行 切换全景场景', event)
    try {
        const { vrSceneMethodAction } = event

        if (window.SHJSceneVrViewer) {
            if (vrSceneMethodAction.type === 'vrSceneToggle') {
                window.SHJSceneVrViewer.loadScene(vrSceneMethodAction.sceneId)
                window.SHJSceneVrViewer.stopAutoRotate()
            }
            if (vrSceneMethodAction.type === 'vrSceneToggleAngle') {
                window.SHJSceneVrViewer.setHfov(vrSceneMethodAction.angle.hfov)
                window.SHJSceneVrViewer.setYaw(vrSceneMethodAction.angle.yaw)
                window.SHJSceneVrViewer.setPitch(vrSceneMethodAction.angle.pitch)
            }
            if (vrSceneMethodAction.type === 'vrSceneStartRotate') {
                window.SHJSceneVrViewer.startAutoRotate()
            }
            if (vrSceneMethodAction.type === 'vrScenePausedRotate') {
                window.SHJSceneVrViewer.stopAutoRotate()
            }
            if (window.SHJSceneVrViewer.audio) {
                console.log(window.SHJSceneVrViewer.audio)
                if (vrSceneMethodAction.type === 'vrScenePlayMusic') {
                    window.SHJSceneVrViewer.audio.value.play()
                }
                if (vrSceneMethodAction.type === 'vrScenePausedMusic') {
                    window.SHJSceneVrViewer.audio.value.pause()
                }
            }

        }

    } catch (error) {
        console.error('执行 更新组件错误', error, event)
    }
}

/** 执行 全屏/窗口化 */
export const exeEventFullScreen = (event: any) => {
    try {
        const { fullscreenAction } = event
        if (fullscreenAction && fullscreenAction.status) {
            if (fullscreenAction.status === 'fullscreen') enter()
            if (fullscreenAction.status === 'window') exit()
            if (fullscreenAction.status === 'toggle') toggle()
        }
    } catch (error) {
        console.error('执行 全屏/窗口化错误', error, event)
    }
}

/** 执行 刷新组件 */
export const exeUpdateWidget = (event: any) => {
    console.log('执行 刷新组件', event)
    try {
        if (event.updateWidget.targetLayerId) {
            const currentComponent = window.SHJComponentRefs.find(i => i.layerId === event.updateWidget.targetLayerId)
            if (currentComponent && currentComponent.ref && currentComponent.ref.refresh) {
                currentComponent.ref.refresh()
            }
        }
    } catch (error) {
        console.error('执行 刷新组件错误', error, event)
    }
}

window.SHJParseEvent = parseEvents