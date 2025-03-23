import { storeToRefs } from 'pinia'
import pinia from '../piniaInstance'
import { usePageStore } from '../../stores/pageStore'
import { refreshLayerAndSceneData } from '../utils'

const pageStore = usePageStore(pinia)
const { currentPage } = storeToRefs(pageStore)

/** 执行 更新数据变量 */
export const execUpdateVariable = (event: any, params: any) => {
    console.log('执行 更新数据变量', event, params)
    try {
        const { updateVariableAction } = event
        const currentVariableData = currentPage.value.variableData.find(i => (i.id === updateVariableAction.name || i.name === updateVariableAction.name))
        if (currentVariableData) {
            if (event.updateVariableAction.dataType === 'params') {
                // 1. 事件返回值
                currentVariableData._value = params
                refreshLayerAndSceneData(currentVariableData)
            } else {
                window.SHJDatasourceV2({
                    sources: [updateVariableAction.useDataSource],
                    isStore: false,
                    noUseMapping: true,
                    tId: '',
                    isInterval: false,
                    callback: (res: any) => {
                        currentVariableData._value = res
                        refreshLayerAndSceneData(currentVariableData)
                    }
                })
            }
        }
    } catch (error) {
        console.error('执行 更新数据变量错误', error, event)
    }
}