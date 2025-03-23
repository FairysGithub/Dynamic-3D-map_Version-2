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

export const execEventUe = (event: any, params: any) => {
    console.log('执行 调用UE', event, params)
    try {
        const { actions, ueShjExecMethodAction, ueCommonsWebscoketAction } = event
        if (actions === 'ueShjExecMethod') {
            handleUeShjExecMethod(ueShjExecMethodAction, params)
        }
        if (actions === 'ueCommonsWebscoket') {
            handleUeCommonsWebscoket(ueCommonsWebscoketAction, params)
        }
    } catch (error) {
        console.error('执行 调用UE错误', error, event)
    }
}

export const handleUeShjExecMethod = (ueShjExecMethodAction: any, params: any) => {
    if (ueShjExecMethodAction.dataType === 'params') {
        try {
            const strParam = toStringify(params)
            if (ueShjExecMethodAction.escape) {
                window.ue5(ueShjExecMethodAction.functionName, JSON.stringify(strParam))
            } else {
                window.ue5(ueShjExecMethodAction.functionName, strParam)
            }
        } catch (error) {
            console.log(error)
        }
    } else {
        window.SHJDatasourceV2({
            sources: [ueShjExecMethodAction.useDataSource],
            isStore: false,
            noUseMapping: true,
            tId: '',
            isInterval: false,
            callback: (res: any) => {
                if (res) {
                    const strParam = toStringify(res)
                    if (ueShjExecMethodAction.escape) {
                        window.ue5(ueShjExecMethodAction.functionName, JSON.stringify(strParam))
                    } else {
                        window.ue5(ueShjExecMethodAction.functionName, strParam)
                    }
                }
            }
        })
    }
}

export const handleUeCommonsWebscoket = (ueCommonsWebscoketAction: any, params: any) => {
    if (ueCommonsWebscoketAction.dataType === 'params') {
        try {
            const strParam = toStringify(params)
            if (ueCommonsWebscoketAction.escape) {
                window.SHJSceneUEIframeWebscoket.send(JSON.stringify(strParam))
            } else {
                window.SHJSceneUEIframeWebscoket.send(strParam)
            }
        } catch (error) {
            console.log(error)
        }
    } else {
        window.SHJDatasourceV2({
            sources: [ueCommonsWebscoketAction.useDataSource],
            isStore: false,
            noUseMapping: true,
            tId: '',
            isInterval: false,
            callback: (res: any) => {
                if (res && window.SHJSceneUEIframeWebscoket) {
                    const strParam = toStringify(res)
                    if (ueCommonsWebscoketAction.escape) {
                        window.SHJSceneUEIframeWebscoket.send(JSON.stringify(strParam))
                    } else {
                        window.SHJSceneUEIframeWebscoket.send(strParam)
                    }
                }
            }
        })
    }
}