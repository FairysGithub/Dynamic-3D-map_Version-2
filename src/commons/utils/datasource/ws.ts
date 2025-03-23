// src/utils/websocket.ts
import { storeToRefs } from 'pinia'
import { wsManager } from './wsManager'
import { useProcessData } from './useMapping'
import { usePageStore } from '../../stores/pageStore'

import pinia from '../piniaInstance'
import { noneData } from './noneData'

const pageStore = usePageStore(pinia)
const { currentPage } = storeToRefs(pageStore)

type WebSocketConfig = {
    url: string
    protocols?: string | string[]
    reconnect?: boolean
    reconnectInterval?: number
    maxReconnectAttempts?: number
    message?: any
    isMessage?: boolean
    isHeaders?: boolean
    headers?: Record<string, string>
    binaryType?: BinaryType
    timeout?: number
}

// 通用变量解析函数
const replaceVariables = (input: string, variables: any[]) => {
    try {
        return input.replace(/\${(.*?)}|\$g{(.*?)}/g, (match, p1, p2) => {
            const varName = p1 || p2
            const variable = variables.find(item => item.name === varName)
            return variable?._value || match
        })
    } catch (error) {
        console.error('变量解析错误:', error)
        return input
    }
}

// 处理对象类型变量替换
const replaceVariablesInObject = (obj: any, variables: any[]) => {
    try {
        const str = JSON.stringify(obj)
        const replaced = replaceVariables(str, variables)
        return JSON.parse(replaced)
    } catch (error) {
        console.error('对象变量替换失败:', error)
        return obj
    }
}

type WsCallback = (data: any) => void
type WsEventCallback = (event: string, data?: any) => void

export class WebSocketInstance {
    private ws: WebSocket | null = null
    private reconnectAttempts = 0
    private timeoutTimer?: any
    private isDisconnecting = false
    private config!: WebSocketConfig

    constructor(
        private source: any,
        private id: string,
        private noUseMapping: boolean,
        private tId: string,
        private onData?: WsCallback,
        private onEvent?: WsEventCallback
    ) {
        const { websocket } = source.source
        if (!websocket) {
            onData?.(noneData(id))
            this.config = {
                url: '',
                reconnect: false,
                timeout: 30000
            }
            return
        }
        this.config = websocket as WebSocketConfig
        this.connect()
    }

    // 新增：获取连接ID
    public getId(): string {
        return this.id
    }

    // 新增：检查连接是否有效
    public isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN
    }

    private processProtocols(): string[] {
        const { protocols = '' } = this.config
        if (!protocols) return []
        return Array.isArray(protocols) ? protocols : protocols.split(/\s*,\s*/)
    }

    private injectHeadersToUrl(url: string): string {
        try {
            const urlObj = new URL(url)
            Object.entries(this.config.headers || {}).forEach(([key, value]) => {
                urlObj.searchParams.append(key, value)
            })
            return urlObj.toString()
        } catch (error) {
            console.error('URL 构造失败:', error)
            return url
        }
    }

    private connect() {
        if (this.isDisconnecting) return

        const {
            url,
            isHeaders = false,
            binaryType = 'blob',
            timeout = 30000
        } = this.config

        const finalUrl = isHeaders ? this.injectHeadersToUrl(url) : url
        const protocolList = this.processProtocols()

        wsManager.closeByComponentIds(this.tId)

        try {
            this.ws = protocolList.length > 0
                ? new WebSocket(finalUrl, protocolList)
                : new WebSocket(finalUrl)

            if (this.ws) {
                wsManager.add(this.ws, this.tId)
                this.ws.binaryType = binaryType

                this.timeoutTimer = setTimeout(() => {
                    if (this.ws?.readyState === WebSocket.CONNECTING) {
                        this.ws.close()
                        console.error('WebSocket 连接超时')
                        this.onEvent?.('error', 'Connection timeout')
                        this.handleClose({ code: 4001, reason: 'Timeout' } as CloseEvent)
                    }
                }, timeout)

                this.ws.onopen = this.handleOpen.bind(this)
                this.ws.onmessage = this.handleMessage.bind(this)
                this.ws.onerror = this.handleError.bind(this)
                this.ws.onclose = this.handleClose.bind(this)

                this.onEvent?.('connecting')
            }
        } catch (error) {
            console.error('WebSocket 连接创建失败:', error)
            this.onEvent?.('error', error)
            this.scheduleReconnect()
        }
    }

    private handleOpen() {
        if (this.timeoutTimer) clearTimeout(this.timeoutTimer)
        console.log('WebSocket 连接成功')
        this.onEvent?.('connected')
        this.reconnectAttempts = 0

        const { message, isMessage } = this.config
        if (message && isMessage) {
            try {
                const originalMessage = typeof message === 'string'
                    ? replaceVariables(message, currentPage.value.variableData)
                    : replaceVariablesInObject(message, currentPage.value.variableData)
                const payload = typeof originalMessage === 'string'
                    ? originalMessage
                    : JSON.stringify(originalMessage)
                this.ws?.send(payload)
                this.onEvent?.('messageSent', payload)
            } catch (error) {
                console.error('初始消息发送失败:', error)
                this.onEvent?.('error', 'Failed to send initial message')
            }
        }
    }

    private async handleMessage(event: MessageEvent) {
        try {
            // 尝试解析 JSON 字符串
            let data = event.data
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data)
                } catch (e) {
                    // 如果解析失败，保持原始数据
                    console.log('数据不是 JSON 格式，使用原始数据')
                }
            }

            const processed = await useProcessData(
                this.source.source.filter,
                data,
                this.source.source.mapping,
                this.id,
                this.source.source.dynamicMapping,
                this.noUseMapping
            )
            // 直接触发回调，不返回 Promise
            this.onData?.(processed)
            this.onEvent?.('data', processed)
        } catch (error) {
            console.error('WebSocket 数据处理失败:', error)
            this.onEvent?.('error', 'Data processing failed')
            this.onData?.(noneData(this.id))
        }
    }

    private handleError(event: Event) {
        console.error('WebSocket 连接错误:', event)
        this.onEvent?.('error', event)
        if (this.ws?.readyState !== WebSocket.OPEN) {
            this.onData?.(noneData(this.id))
        }
    }

    private handleClose(event: CloseEvent) {
        if (this.timeoutTimer) clearTimeout(this.timeoutTimer)
        console.log(`连接关闭，代码: ${event.code}，原因: ${event.reason}`)
        this.onEvent?.('disconnected', { code: event.code, reason: event.reason })

        if (this.shouldReconnect(event)) {
            this.scheduleReconnect()
        } else {
            this.onData?.(noneData(this.id))
        }
    }

    private shouldReconnect(event: CloseEvent): boolean {
        const { reconnect = false, maxReconnectAttempts = 10 } = this.config
        return !this.isDisconnecting &&
            reconnect &&
            this.reconnectAttempts < maxReconnectAttempts &&
            event.code !== 1000 &&
            event.code !== 4001
    }

    private scheduleReconnect() {
        if (this.isDisconnecting) return

        const { reconnectInterval = 5000 } = this.config
        this.reconnectAttempts++
        const delay = reconnectInterval * Math.pow(2, this.reconnectAttempts - 1)
        console.log(`第 ${this.reconnectAttempts} 次重试，${delay}ms 后重连`)
        this.onEvent?.('reconnecting', { attempt: this.reconnectAttempts, delay })
        setTimeout(() => this.connect(), Math.min(delay, 30000))
    }

    public send(data: string | object) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket 未连接')
        }
        const message = typeof data === 'string' ? data : JSON.stringify(data)
        this.ws.send(message)
    }

    public disconnect() {
        this.isDisconnecting = true
        if (this.ws) {
            this.ws.close(1000, 'Manual close')
            if (this.timeoutTimer) clearTimeout(this.timeoutTimer)
            wsManager.closeByComponentIds(this.tId)
        }
    }

    public getWebSocket() {
        return this.ws
    }
}

export const parseWebSocket = (
    source: any,
    id: string,
    noUseMapping: boolean,
    tId: string,
    onData?: WsCallback,
    onEvent?: WsEventCallback
): WebSocketInstance => {
    return new WebSocketInstance(source, id, noUseMapping, tId, onData, onEvent)
}