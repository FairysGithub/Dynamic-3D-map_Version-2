import { isArray } from 'lodash'
import { parseCSV, parseExcel, parseJSON } from './file'
import { parseStaticData } from './static'
import { parseVariableData } from './variable'
import { parseAPIPort } from './api'
import { parseUrlData } from './url'
import { parseWebSocket, WebSocketInstance } from './ws'


// 存储 WebSocket 实例的 Map
const wsInstances = new Map<string, Set<WebSocketInstance>>()

// 新增：检查 WebSocket 是否已存在且有效
const hasValidWebSocket = (tId: string, sourceId: string): boolean => {
    const instances = wsInstances.get(tId)
    if (!instances) return false

    for (const ws of instances) {
        if (ws.getId() === sourceId && ws.isConnected()) {
            return true
        }
    }
    return false
}

window.SHJDatasourceV2 = ({ sources, callback, tId, isStore = false, noUseMapping = false, isInterval = true }) => {
    if (window.SHJDatasourceV2Timer === undefined) {
        window.SHJDatasourceV2Timer = []
    }

    // 优化：只在必要时清理 WebSocket 连接
    const cleanupPreviousWebSockets = (sourceIds: string[]) => {
        const oldWs = wsInstances.get(tId)
        if (oldWs) {
            // 只清理不在新数据源列表中的连接
            oldWs.forEach(instance => {
                if (!sourceIds.includes(instance.getId())) {
                    instance.disconnect()
                    oldWs.delete(instance)
                }
            })
            if (oldWs.size === 0) {
                wsInstances.delete(tId)
            }
        }
    }

    if (sources && isArray(sources) && sources.length > 0) {
        const sourceIds = sources.map(item => item.id)
        cleanupPreviousWebSockets(sourceIds)

        const wsInstancesForComponent = new Set<WebSocketInstance>()
        const existingInstances = wsInstances.get(tId) || new Set<WebSocketInstance>()

        sources.forEach((item) => {
            if (isInterval) {
                const { source } = item
                const currentTimerId = `${tId}-${item.id}`
                const currentTimerObj = window.SHJDatasourceV2Timer.findIndex(i => i.id === currentTimerId)
                if (currentTimerObj !== -1) {
                    clearInterval(window.SHJDatasourceV2Timer[currentTimerObj].timer)
                    window.SHJDatasourceV2Timer.splice(currentTimerObj, 1)
                }
                if (source.isAutoUpdate) {
                    const timer = setInterval(() => {
                        parseDataSources(item, isStore, noUseMapping, (data: any) => {
                            callback && callback(data)
                        })
                    }, source.autoUpdateTime * 1000)
                    window.SHJDatasourceV2Timer.push({ id: currentTimerId, timer })
                }
            }
            // 对于 WebSocket 类型的数据源，使用新的处理方式
            if (item.source.type === 'ws') {
                // 检查是否已有有效连接
                if (!hasValidWebSocket(tId, item.id)) {
                    const wsInstance = parseWebSocket(
                        item,
                        item.id,
                        noUseMapping,
                        tId,
                        (data) => {
                            console.log('WebSocket 原始数据:', data)

                            // 统一数据格式为 { data: [{ data: actualData }] }
                            const formattedData = {
                                data: [{
                                    data: data.finalUserData.data
                                }]
                            }
                            console.log('WebSocket 统一格式后的数据:', formattedData)
                            callback && callback(formattedData)
                        },
                        (event, data) => {
                            console.log(`WebSocket Event [${tId}]:`, event, data)
                        }
                    )
                    wsInstancesForComponent.add(wsInstance)
                } else {
                    // 如果已有有效连接，保留现有连接
                    existingInstances.forEach(instance => {
                        if (instance.getId() === item.id) {
                            wsInstancesForComponent.add(instance)
                        }
                    })
                }
            } else {
                // 其他类型的数据源保持原有处理方式
                parseDataSources(item, isStore, noUseMapping, (data: any) => {
                    callback && callback(data)
                })
            }

        })
    } else {
        callback && callback([])
    }
}

const parseDataSources = (sources: any, isStore: boolean = false, noUseMapping: boolean = false, callback: Function) => {
    if (sources) {
        let taskData = null
        const { source, id } = sources
        if (source.type === 'url') taskData = parseUrlData(sources, id, noUseMapping)
        if (source.type === 'static') taskData = parseStaticData(sources, id, noUseMapping)
        if (source.type === 'variable') taskData = parseVariableData(sources, id, noUseMapping)
        if (source.type === 'api') taskData = parseAPIPort(sources, id, noUseMapping)
        if (source.type === 'csv') taskData = parseCSV(sources, id, noUseMapping)
        if (source.type === 'json') taskData = parseJSON(sources, id, noUseMapping)
        if (source.type === 'excel') taskData = parseExcel(sources, id, noUseMapping)
       // WebSocket 类型在外层处理
        if (source.type === 'ws') return
        
        if (taskData) {
            taskData.then((data: any) => {
                if (!noUseMapping) {
                    callback && callback(data.finalKeyData)
                }
                if (noUseMapping) {
                    callback && callback(data.noMappingData)
                }
            })
        }
    }
}