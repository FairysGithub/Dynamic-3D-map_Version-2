import { storeToRefs } from 'pinia'
import { isArray } from 'lodash'
import { HttpRequest, IContentType } from '../request/index'
import { usePageStore } from '../../stores/pageStore'
import { useProcessData } from './useMapping'


import pinia from '../piniaInstance'
import { noneData } from './noneData'
const pageStore = usePageStore(pinia)
const { currentPage } = storeToRefs(pageStore)

const httpRequest = new HttpRequest()

export const parseAPIPort = (source: any, id: string, noUseMapping: boolean) => {
    return new Promise(function (resolve, reject) {
        const { api } = source.source
        try {
            if (api) {
                let { isHeaders, isBody, headers, contentType, url, postParam } = api

                const request = (req: any) => {
                    req.then((res: any) => {
                        if (res.status === 200) {
                            const { filter, mapping } = source.source
                            useProcessData(filter, res.data, mapping, id, source.source.dynamicMapping, noUseMapping).then((response) => {
                                if (response) {
                                    resolve(response)
                                }
                            }).catch(() => resolve(noneData(id)))
                        } else {
                            resolve(noneData(id))
                        }
                    }).catch(() => {
                        resolve(noneData(id))
                    })
                }

                /**
                 * 解析URL是否包含http，
                 * 不包含  则解析BaseUrl
                 * 包含    则忽略解析BaseUrl
                 */
                let preUrl: string = ''
                if (!api.url.includes('http') && currentPage.value.environments) {
                    const currentEnv = currentPage.value.environments.filter(i => i.selected)
                    if (currentEnv && isArray(currentEnv) && currentEnv.length > 0) {
                        preUrl = currentEnv[0].envBaseUrl || ''
                    }
                }

                try {
                    /**
                     * 1. 解析URL中是否包含全局变量
                     * 包含   则解析全局变量
                     * 不包含 则忽略
                     */
                    const matches = url.match(/\${(.*?)}/g)
                    if (matches) {
                        for (let i = 0; i < matches.length; i++) {
                            const variable = currentPage.value.variableData.filter(item => item.name === matches[i].substring(2, matches[i].length - 1))
                            if (variable && isArray(variable) && variable.length > 0) {
                                url = url.replaceAll(matches[i], variable[0]._value)
                            }
                        }
                    }
                } catch (error) {
                    console.log('解析url错误')
                }

                try {
                    /**
                     * 2. 解析body中是否包含全局变量
                     * 包含   则解析全局变量
                     * 不包含 则忽略
                     */
                    let bodyStr = isBody ? JSON.stringify(postParam) : ''
                    const matchesBody = bodyStr.match(/\$g{(.*?)}/g)
                    if (matchesBody) {
                        for (let i = 0; i < matchesBody.length; i++) {
                            const variable = currentPage.value.variableData.filter(item => item.name === matchesBody[i].substring(3, matchesBody[i].length - 1))
                            if (variable && isArray(variable) && variable.length > 0) {
                                bodyStr = bodyStr.replaceAll(matchesBody[i], variable[0]._value)
                            }
                        }
                        postParam = JSON.parse(bodyStr)
                    }
                } catch (error) {
                    console.log('解析body错误')
                }

                try {
                    /**
                     * 3. 解析header中是否包含全局变量
                     * 包含   则解析全局变量
                     * 不包含 则忽略
                     */
                    let headerStr = isHeaders ? JSON.stringify(headers) : ''
                    const matchesHeader = headerStr.match(/\$g{(.*?)}/g)
                    if (matchesHeader) {
                        for (let i = 0; i < matchesHeader.length; i++) {
                            const variable = currentPage.value.variableData.filter(item => item.name === matchesHeader[i].substring(3, matchesHeader[i].length - 1))
                            if (variable && isArray(variable) && variable.length > 0) {
                                headerStr = headerStr.replaceAll(matchesHeader[i], variable[0]._value)
                            }
                        }
                        headers = JSON.parse(headerStr)
                    }
                } catch (error) {
                    console.log('解析header错误')
                }

                if (api.type === 'GET') request(httpRequest.get(preUrl + url, { headers }))
                if (api.type === 'POST') request(httpRequest.post(preUrl + url, postParam, { headers }, (contentType as IContentType)))
                if (api.type === 'PUT') request(httpRequest.put(preUrl + url, postParam, { headers }, (contentType as IContentType)))
                if (api.type === 'DELETE') request(httpRequest.delete(preUrl + url, { headers }))
            } else {
                resolve(noneData(id))
            }
        } catch (error) {
            resolve(noneData(id))
        }
    })
}