// @ts-ignore
import { defineStore } from 'pinia'


/**
 * 用于存储当前正在渲染的页面基础的信息
 * 包含变量、环境、状态等集合信息
 */
export const usePageStore = defineStore('page', {
    state() {
        return {
            currentPage: {}
        } as {
            /** 页面基础参数配置 */
            currentPage: {
                /** 场景相关参数 */
                sceneOption: any,
                /** 场景ID */
                sceneId: number,
                /** 全局事件 */
                globalEvent: any[],
                /** 数据变量集合 */
                variableData: any[],
                /** API环境相关 */
                environments: any[],
                /** 状态集合 */
                states: any[],
                /** 默认子页面 */
                defaultView: string
            }
        }
    },
    actions: {
        setCurrentPage(data: any): void {
            this.currentPage = data
        },
        setCurrentPageVariableData(data: any): void {
            this.currentPage.variableData = data
        }
    }
})