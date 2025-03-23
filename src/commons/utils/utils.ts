import { isArray, isString } from "lodash"
import { isNumber } from "lodash"

export const handlePageString2JsonData = (page: any) => {
    if (page && page.states) {
        page.states.forEach(layer => {
            try {
                if (layer.option && isString(layer.option)) layer.option = JSON.parse(layer.option as unknown as string)
            } catch (error) {
                console.log('转换layer.option 出现错误，检查数据！')
            }
            try {
                if (layer.sources && isString(layer.sources)) {
                    layer.sources = JSON.parse(layer.sources as unknown as string)
                    if (layer.sources.length > 0) {
                        layer.sources.forEach((item, index) => {
                            try {
                                if (item && isString(item)) layer.sources[index] = JSON.parse(item as unknown as string)
                            } catch (error) {
                                console.log('转换layer.sources 出现错误，检查数据！')
                            }
                        })
                    }
                }
            } catch (error) {
                console.log('转换layer.sources 出现错误，检查数据！')
            }
            try {
                if (layer.events && isString(layer.events)) {
                    layer.events = JSON.parse(layer.events as unknown as string)
                }
            } catch (error) {
                console.log('转换layer.events 出现错误，检查数据！')
            }
            try {
                if (layer.border && isString(layer.border)) layer.border = JSON.parse(layer.border as unknown as string)
            } catch (error) {
                console.log('转换layer.border 出现错误，检查数据！')
            }
            try {
                if (layer.background && isString(layer.background)) layer.background = JSON.parse(layer.background as unknown as string)
            } catch (error) {
                console.log('转换layer.background 出现错误，检查数据！')
            }
            try {
                if (layer.animation && isString(layer.animation)) {
                    layer.animation = JSON.parse(layer.animation as unknown as string)
                    if (layer.animation && isArray(layer.animation)) {
                        layer.animation.forEach(item => {
                            if (item.type === 'enter') {
                                layer.animation.enter = item
                            }
                            if (item.type === 'exit') {
                                layer.animation.exit = item
                            }
                        })
                    }
                }
            } catch (error) {
                console.log('转换layer.animation 出现错误，检查数据！')
            }
            try {
                if (layer.shadow && isString(layer.shadow)) layer.shadow = JSON.parse(layer.shadow as unknown as string)
            } catch (error) {
                console.log('转换layer.shadow 出现错误，检查数据！')
            }
            try {
                if (layer.radius && isString(layer.radius)) layer.radius = JSON.parse(layer.radius as unknown as string)
            } catch (error) {
                console.log('转换layer.radius 出现错误，检查数据！')
            }
            try {
                if (layer.layerEvent && isString(layer.layerEvent)) layer.layerEvent = JSON.parse(layer.layerEvent as unknown as string)
            } catch (error) {
                console.log('转换layer.layerEvent 出现错误，检查数据！')
            }
            try {
                if (layer.states && isString(layer.states)) layer.states = JSON.parse(layer.states as unknown as string)
            } catch (error) {
                console.log('转换layer.states 出现错误，检查数据！')
            }
            if (layer.states && isArray(layer.states)) {
                handlePageString2JsonData(layer)
            }
        })
    }
    return page
}
export const execEvent = (event: any[], type: string, params?: any) => window.SHJParseEvent(event, type, params)
export const execStatesEvent = (layerId: string, states: any[], type: string, params?: any) => {
    let layer: any = states.find(item => item.id === layerId)
    if (layer.useState) {
        const result = layer.states.find(item => item.stateId === layer.useState)
        if (result) {
            layer = result
        }
    }
    window.SHJParseEvent(layer.layerEvent, type, params)
}
export const findLayerUseState = (layerId: string, states: any[]) => {
    let layer = states.find(item => item.id === layerId)
    if (layer) {
        return layer.useState
    }
    return ''

}
export const layerRenderStyles1 = (layerId: string, states: any[]): any => {
    let layer: any = states.find(item => item.id === layerId)
    if (layer.useState) {
        const result = layer.states.find(item => item.stateId === layer.useState)
        if (result) {
            layer = result
        }
    }
    if (layer) {
        if (layer.rotate3dX === undefined) layer.rotate3dX = 0
        if (layer.rotate3dY === undefined) layer.rotate3dY = 0
        if (layer.rotate3dZ === undefined) layer.rotate3dZ = 0
        if (layer.transformOriginX === undefined) layer.transformOriginX = 50
        if (layer.transformOriginY === undefined) layer.transformOriginY = 50

        let perspective = ''
        if (layer.rotate || layer.rotate3dX || layer.rotate3dY || layer.rotate3dZ) {
            perspective = layer.perspective === undefined ? '20000px' : `${layer.perspective}px`
        }
        return {
            width: parseInt(layer.width.toString()) + 'px',
            height: parseInt(layer.height.toString()) + 'px',
            transform: `matrix(1, 0, 0, 1, ${parseInt(layer.left.toString())}, ${parseInt(layer.top.toString())})`,
            visibility: layer.visible ? 'visible' : 'hidden',
            zIndex: layer.zIndex,
            mixBlendMode: layer.blendMode || '',
            perspective
        }
    }
}
export const layerRenderStyles2 = (layerId: string, states: any[]): any => {
    let layer: any = states.find(item => item.id === layerId)
    if (layer.useState) {
        const result = layer.states.find(item => item.stateId === layer.useState)
        if (result) {
            layer = result
        }
    }
    if (layer) {
        let animations = ''
        if (layer.animation && layer.animation.enter) {
            animations = `${layer.animation.enter.duration}ms ease ${layer.animation.enter.delay}ms  normal both running ${layer.animation.enter.count} ${layer.animation.enter.name}`
        }
        return {
            transform: `rotate(${layer.rotate}deg) rotateX(${layer.rotate3dX}deg) rotateY(${layer.rotate3dY}deg) rotateZ(${layer.rotate3dZ}deg)`,
            transformOrigin: `${layer.transformOriginX}% ${layer.transformOriginY}%`,
            animation: animations
        }
    }
}
export const layerRenderStyles3 = (layerId: string, states: any[]): any => {
    let layer: any = states.find(item => item.id === layerId)
    if (layer.useState) {
        const result = layer.states.find(item => item.stateId === layer.useState)
        if (result) {
            layer = result
        }
    }
    if (layer) {
        const border = layer.border
        const shadow = layer.shadow

        let borderTop = '0px'
        let borderLeft = '0px'
        let borderRight = '0px'
        let borderBottom = '0px'

        if (layer.border) {
            borderTop = border.value.itemStyle.top ? border.value.width + 'px' : '0px'
            borderLeft = border.value.itemStyle.left ? border.value.width + 'px' : '0px'
            borderRight = border.value.itemStyle.right ? border.value.width + 'px' : '0px'
            borderBottom = border.value.itemStyle.bottom ? border.value.width + 'px' : '0px'
        }

        return {
            pointerEvents: (layer.layerEvent && layer.layerEvent.length > 0) ? 'all' : 'none',
            opacity: layer.opacity ? layer.opacity + '%' : 0,
            borderWidth: border.show ? border.value.width + 'px' : '0px',
            borderStyle: border.show ? border.value.style : '',
            borderColor: border.show ? border.value.color : '',
            borderTopWidth: borderTop,
            borderLeftWidth: borderLeft,
            borderRightWidth: borderRight,
            borderBottomWidth: borderBottom,
            borderRadius: isNumber(layer.radius) ? layer.radius + 'px' : ` ${layer.radius.leftTop}px ${layer.radius.rightTop}px ${layer.radius.rightBottom}px ${layer.radius.leftBottom}px`,
            background: layer.background.show ? layer.background.value : '',
            boxShadow: shadow.show ? `${shadow.value.x}px ${shadow.value.y}px ${shadow.value.ambiguity}px ${shadow.value.diffusion}px ${shadow.value.color}` : ''
        }
    }
}
export const initVariableDataValue = (variableData: any[]) => {
    /**
     * 按照先后顺序执行
     */
    const renderVar = (data: any[]) => {
        for (let i = 0; i < data.length; i++) {
            const element = data[i]
            window.SHJDatasourceV2({
                sources: [element.sources],
                isStore: false,
                noUseMapping: true,
                tId: element.id,
                callback: (res: any) => {
                    element._value = res
                    refreshLayerAndSceneData(element)

                    renderVar(variableData.filter(item => item.pid === element.id))
                }
            })
        }
    }
    setTimeout(() => {
        renderVar(variableData.filter(item => !item.pid))
    }, 0)
}

export const refreshLayerAndSceneData = (data: any) => {
    // 刷新视图
    if (data.useList && isArray(data.useList) && data.useList.length > 0) {
        data.useList.forEach(id => {
            const currentComponent = window.SHJComponentRefs.find(component => {
                if (component.layerId === id) {
                    return component
                }
                if (component.sceneId === id) {
                    return component
                }
                return undefined
            })
            try {
                if (currentComponent && currentComponent.ref) {
                    currentComponent.ref.refreshData()
                }
            } catch (error) {
                console.error('refreshData-刷新失败')
            }
        })
    }
}