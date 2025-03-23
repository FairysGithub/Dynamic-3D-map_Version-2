export class WebSocket2 {
    host: string
    baseUrl: string
    url: string
    constructor (host: string, baseUrl: string) {
        this.host = host
        this.baseUrl = baseUrl
        this.url = `${this.host}${this.baseUrl}`
    }

    createdSocket ({ roomName, onopen = () => { }, onmessage = () => { }, opclose = () => { } }: any) {
        let socket: any = null

        if ('WebSocket' in window) {
            socket = new WebSocket(`${this.host}${this.baseUrl}/${roomName}`)
        } else {
            return false // 浏览器不支持websocket
        }

        // socket 是 WebSocket 的一个实例， 本身自带方法 onopen等， 显然现在 需要自定义onopen等的要做的处理， 所以说是在写 socket本身函数的内容
        socket.onopen = () => { onopen(socket) }
        socket.onmessage = (event: { data: any }) => { onmessage(event, event.data) }
        socket.onclose = () => { opclose(socket) }
        socket.onerror = () => { socket.close() }
        window.onbeforeunload = () => { socket.close() }
        return socket
    }
}