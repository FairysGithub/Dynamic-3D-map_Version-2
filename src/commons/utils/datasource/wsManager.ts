type WebSocketEntry = {
    ws: WebSocket;
    componentId: string; // 关联的组件 ID
};

class WebSocketManager {
    // eslint-disable-next-line no-use-before-define
    private static instance: WebSocketManager
    private connections = new Set<WebSocketEntry>()

    // 单例模式
    public static getInstance(): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager()
        }
        return WebSocketManager.instance
    }

    // 添加 WebSocket 连接
    add(ws: WebSocket, componentId: string) {
        // 先检查并关闭同一组件ID的现有连接
        const existingEntries = Array.from(this.connections).filter(entry => entry.componentId === componentId)
        existingEntries.forEach(entry => {
            this.removeAllListeners(entry.ws)
            if (entry.ws.readyState !== WebSocket.CLOSED) {
                try {
                    entry.ws.close(1000, `Replacing connection for component ${componentId}`)
                } catch (err) {
                    console.error('关闭旧连接失败:', err)
                }
            }
            this.connections.delete(entry)
        })

        // 添加新连接
        const newEntry = { ws, componentId }
        this.connections.add(newEntry)
        this.setupAutoRemove(ws, newEntry)

        console.log(`WebSocket added for component ${componentId}, total connections:`, this.connections.size)
    }

    // 改进点：更彻底的连接关闭 + 内存泄漏防护
    closeByComponentIds(componentIds: string | string[]) {
        // 参数标准化
        const idArray = Array.isArray(componentIds) ? componentIds : [componentIds]
        const idSet = new Set(idArray)

        const toClose = Array.from(this.connections).filter(entry =>
            idSet.has(entry.componentId) &&
            entry.ws.readyState !== WebSocket.CLOSED
        )

        toClose.forEach(entry => {
            this.removeAllListeners(entry.ws)
            try {
                entry.ws.close(1000, `Component ${entry.componentId} unmounted`)
            } catch (err) {
                console.error('关闭 WebSocket 失败:', err)
            }
            this.connections.delete(entry)
        })

        console.log(`Closed ${toClose.length} connections for components:`, idArray)
    }

    // 辅助方法：清理事件监听器
    private removeAllListeners(ws: WebSocket) {
        const noop = () => { }
        ws.onopen = noop
        ws.onmessage = noop
        ws.onerror = noop
        ws.onclose = noop

        // 如果使用 EventEmitter 风格的事件监听
        if ('removeAllListeners' in ws) {
            (ws as any).removeAllListeners()
        }
    }

    // 关闭所有连接
    closeAll() {
        this.connections.forEach(entry => {
            if (entry.ws.readyState === WebSocket.OPEN || entry.ws.readyState === WebSocket.CONNECTING) {
                try {
                    entry.ws.close(1000, 'All connections closed')
                } catch (err) {
                    console.error('关闭连接失败:', err)
                }
            }
        })
        this.connections.clear()
        console.log('All WebSocket connections closed')
    }

    // 自动移除已关闭的连接
    private setupAutoRemove(ws: WebSocket, entry: WebSocketEntry) {
        const originalClose = ws.close.bind(ws)
        ws.close = ((code?: number, reason?: string) => {
            this.connections.delete(entry)
            originalClose(code, reason)
            console.log(`WebSocket auto-removed for component ${entry.componentId}`)
        }) as typeof ws.close

        ws.onclose = () => {
            this.connections.delete(entry)
            console.log(`WebSocket closed for component ${entry.componentId}`)
        }
    }

    // 用于调试的方法
    getConnectionsInfo() {
        return Array.from(this.connections).map(entry => ({
            componentId: entry.componentId,
            readyState: entry.ws.readyState
        }))
    }
}

export const wsManager = WebSocketManager.getInstance()