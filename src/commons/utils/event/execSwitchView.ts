import { storeToRefs } from 'pinia'

import { usePageStore } from '@/commons/stores/pageStore'


const pageStore = usePageStore()
const { currentPage } = storeToRefs(pageStore)


/** 执行 跳转子页面 */
export const execSwitchView = (event: any) => {
    console.log('执行 跳转子页面', event)
    try {
        currentPage.value.defaultView = event.switchViewAction.viewId
    } catch (error) {
        console.error('执行 跳转子页面', error, event)
    }
}