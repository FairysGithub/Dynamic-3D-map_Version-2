const toStringify = (json: any): string => {
    try {
        let cache: any = []
        const str = JSON.stringify(json, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) return
                cache.push(value)
            }
            return value
        })
        cache = null
        return str
    } catch (error) {
        return ''
    }
}

export const exeEventUnity = (event: any, params: any) => {
    console.log('执行 调用Unity方法', event)
    try {
        const { actions, unityIframeExecMethodAction, unityWebglExecMethodAction } = event
        if (actions === 'unityWebglExecMethod') {
            handleUnityWebglExecMethod(unityWebglExecMethodAction, params)
        }
        if (actions === 'unityIframeExecMethod') {
            handleUnityIframeExecMethod(unityIframeExecMethodAction, params)
        }
    } catch (error) {
        console.error('执行 调用Unity方法错误', error, event)
    }
}

export const handleUnityWebglExecMethod = (unityWebglExecMethodAction: any, params: any) => {
    if (unityWebglExecMethodAction.dataType === 'params') {
        try {
            const strParam = toStringify(params)
            if (window.SHJSceneUnityIframeInstance.ref) {
                window.SHJSceneUnityIframeInstance.ref.contentWindow.postMessage({ object: unityWebglExecMethodAction.objectName, function: unityWebglExecMethodAction.functionName, data: strParam }, window.SHJSceneUnityIframeInstance.url)
            }
        } catch (error) {
            console.error(error)
        }
    } else {
        window.SHJDatasourceV2({
            sources: [unityWebglExecMethodAction.useDataSource],
            isStore: false,
            noUseMapping: true,
            tId: '',
            isInterval: false,
            callback: (res: any) => {
                if (window.SHJSceneUnityIframeInstance.ref) {
                    window.SHJSceneUnityIframeInstance.ref.contentWindow.postMessage({ object: unityWebglExecMethodAction.objectName, function: unityWebglExecMethodAction.functionName, data: res }, window.SHJSceneUnityIframeInstance.url)
                }
            }
        })
    }
}

export const handleUnityIframeExecMethod = (unityIframeExecMethodAction: any, params: any) => {
    if (unityIframeExecMethodAction.dataType === 'params') {
        try {
            const strParam = toStringify(params)
            if (window.SHJSceneUnityIframeInstance.ref) {
                window.SHJSceneUnityIframeInstance.ref.contentWindow.postMessage({ object: unityIframeExecMethodAction.objectName, function: unityIframeExecMethodAction.functionName, data: strParam }, window.SHJSceneUnityIframeInstance.url)
            }
        } catch (error) {
            console.error(error)
        }
    } else {
        window.SHJDatasourceV2({
            sources: [unityIframeExecMethodAction.useDataSource],
            isStore: false,
            noUseMapping: true,
            tId: '',
            isInterval: false,
            callback: (res: any) => {
                if (window.SHJSceneUnityIframeInstance.ref) {
                    window.SHJSceneUnityIframeInstance.ref.contentWindow.postMessage({ object: unityIframeExecMethodAction.objectName, function: unityIframeExecMethodAction.functionName, data: res }, window.SHJSceneUnityIframeInstance.url)
                }
            }
        })
    }
}