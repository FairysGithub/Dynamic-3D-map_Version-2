import { cloneDeep, isArray, isEqual } from 'lodash'

import { useFilterData } from './useFilter'

/** 映射关系处理 */
export const useProcessData = (filter: any, data: any, mappings: any[], id: string, dynamicMapping?: boolean, noUseMapping?: boolean) => {
    return new Promise(function (resolve): void {
        // 原始数据
        const rawData = cloneDeep({ id, data })
        useFilterData(filter, data).then((response: any) => {
            // 过滤后的数据
            const filteredData = cloneDeep({ id, data: response })
            if (!noUseMapping) {
                // 映射后的数据
                let mappedData: any[] = []
                if (isArray(response)) {
                    mappedData = response.map((item: any, index: number) => {
                        const newItem: Record<string, any> = {}
                        if (dynamicMapping && dynamicMapping) {
                            if (index === 0) {
                                // 动态 mappings
                                const result: any[] = []
                                for (const key in item) {
                                    const oldItem = mappings.find(fm => fm.name === key)
                                    if (oldItem) {
                                        result.push({ alias: oldItem.alias, name: key, type: 'any', label: key, mapping: oldItem.mapping, status: true })
                                    } else {
                                        result.push({ alias: key, name: key, type: 'any', label: key, mapping: key, status: true })
                                    }
                                }
                                mappings.splice(0, mappings.length)
                                mappings.push(...result)
                            }
                        }
                        mappings.forEach((field: any) => {
                            if (field.alias) {
                                newItem[field.alias] = item[field.mapping]
                            } else {
                                newItem[field.name] = item[field.mapping]
                            }
                        })
                        return newItem
                    })
                }
                // 最终UserData
                const userData = cloneDeep({ id, data: mappedData })
                // 最终KeyData
                const keyData = cloneDeep({ id, data: parseMappedData(mappedData, mappings, id) })
                resolve({
                    id,
                    finalKeyData: mappedData.length === 0 ? { id, data: response } : keyData,
                    finalUserData: mappedData.length === 0 ? { id, data: response } : userData,
                    filteredData,
                    rawData,
                    noMappingData: []
                })
            } else {
                resolve({
                    id,
                    finalKeyData: [],
                    finalUserData: { id, data: response },
                    filteredData,
                    rawData,
                    noMappingData: response
                })
            }
        })
    })
}

/** 解析数据为Key、Data格式 */
export const parseMappedData = (data: any[], mappings: any[], id: string) => {
    return data.reduce<{ key: string; data: any[]; }[]>(
        (results, item) => {
            let seriesKey: string = '系列一'
            if (mappings && mappings.find((field) => field.name === 'series')) {
                seriesKey = item[(mappings.find((field) => field.name === 'series')!.name)]
                delete item[(mappings.find((field) => field.name === 'series')!.name)]
            }

            const existingSeries = results.find((series) => series.key === seriesKey)

            if (existingSeries) {
                existingSeries.data.push(item)
            } else {
                results.push({ key: seriesKey, data: [item] })
            }
            return results
        },
        []
    )
}
