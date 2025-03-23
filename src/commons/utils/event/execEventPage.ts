import { storeToRefs } from 'pinia'
import { isArray } from 'lodash'
import router from '@/commons/router'

import pinia from '../piniaInstance'
import { usePageStore } from '../../stores/pageStore'

const pageStore = usePageStore(pinia)
const { currentPage } = storeToRefs(pageStore)


/**
 * URL参数转换为JSON对象
 * @param urlParam
 * @returns
 */
export const urlParamToJson = (urlParam: string) => {
    if (!urlParam) return urlParam
    const json: any = {}
    urlParam.trim().split('&').forEach((item: string) => json[item.split('=')[0]] = item.split('=')[1])
    return json
}

/** 执行 跳转页面 */
export const execEventPage = (event: any) => {
    console.log('执行 跳转页面', event)
    try {
        const { pageAction } = event
    
        if (pageAction.target && pageAction.target !== '') {
            let parameter = pageAction.parameter
            try {
                /**
                 * 1. 解析parameter中是否包含全局变量
                 * 包含   则解析全局变量
                 * 不包含 则忽略
                 */
                let parameterStr = JSON.stringify(parameter)
                const matchesBody = parameterStr.match(/\$g{(.*?)}/g)
                if (matchesBody) {
                    for (let i = 0; i < matchesBody.length; i++) {
                        const variable = currentPage.value.variableData.filter(item => item.name === matchesBody[i].substring(3, matchesBody[i].length - 1))
                        if (variable && isArray(variable) && variable.length > 0) {
                            parameterStr = parameterStr.replaceAll(matchesBody[i], variable[0]._value)
                        }
                    }
                    parameter = JSON.parse(parameterStr)
                }
            } catch (error) {
                console.log('解析body错误')
            }

            const query = parameter
                ? {
                    query: urlParamToJson(parameter)
                }
                : {}


            router.push({
                path: pageAction.target,
                ...query
            })


        }
    } catch (error) {
        console.error('执行 跳转页面错误', error, event)
    }
}