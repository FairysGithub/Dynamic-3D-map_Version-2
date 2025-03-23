import { storeToRefs } from 'pinia'
import { isArray, isString } from 'lodash'
import { usePageStore } from '../../stores/pageStore'
import pinia from '../piniaInstance'

const pageStore = usePageStore(pinia)
const { currentPage } = storeToRefs(pageStore)

export const useFilterData = (filter: string, data: any) => {
    return new Promise((resolve, reject) => {
        if (isString(filter)) {
            try {
                let codeStr = `
                    ${filter}
        
                    // 在这里调用 filter 函数，并传递 data 参数
                    return filter(data);
                `
                /**
                 * 解析是否包含全局变量
                 * 包含   则解析全局变量
                 * 不包含 则忽略
                 */
                const removeComments = (str: string) => str.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
                codeStr = removeComments(codeStr)
                const matches = codeStr.match(/\$g{(.*?)}/g)
                if (matches) {
                    try {
                        for (let i = 0; i < matches.length; i++) {
                            const variable = currentPage.value.variableData.filter(item => item.name === matches[i].substring(3, matches[i].length - 1))
                            if (variable && isArray(variable) && variable.length > 0) {
                                codeStr = codeStr.replaceAll(matches[i], variable[0]._value)
                            }
                        }
                    } catch (error) {
                        console.log('解析全局变量错误')
                    }
                }
                const dynamicFunction = new Function('data', codeStr)
                resolve(dynamicFunction(data))
            } catch (error: any) {
                resolve(null)
            }
        } else {
            resolve(data)
        }
    })
}