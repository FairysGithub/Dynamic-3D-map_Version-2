export const execEventSendApi = (event: any) => {
    console.log('执行 发送数据', event)
    try {
        const { sendAPIAction } = event
        window.SHJDatasourceV2({
            sources: [sendAPIAction.useDataSource],
            isStore: false,
            noUseMapping: true,
            tId: '',
            isInterval: false
        })
    } catch (error) {
        console.error('执行 发送数据错误', error, event)
    }
}