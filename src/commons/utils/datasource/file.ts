import { ref } from 'vue'

import { HttpRequest } from '../request/index'
import { useProcessData } from './useMapping'

const httpRequest = new HttpRequest()

export const fileRequests = (api: any, filter: any, mapping: any[], id: string, dynamicMapping: boolean, noUseMapping: boolean) => {
    return new Promise((resolve, reject) => {
        httpRequest.get(api.url).then(res => {
            if (res.data) {
                const parsedData = ref<any[]>([])
                if (res.data.length <= 1) {
                    parsedData.value = res.data[0].data
                } else {
                    parsedData.value = res.data
                }
                useProcessData(filter, parsedData.value, mapping, id, dynamicMapping, noUseMapping).then((response) => {
                    resolve(response)
                })
            }
        })
    })
}

/** 解析CSV */
export const parseCSV = (source: any, id: string, noUseMapping: boolean) => {
    const {
        api,
        filter,
        mapping,
        dynamicMapping
    } = source.source
    return fileRequests(api!, filter, mapping, id, dynamicMapping!, noUseMapping)
}

/** 解析JSON */
export const parseJSON = (source: any, id: string, noUseMapping: boolean) => {
    const {
        api,
        filter,
        mapping,
        dynamicMapping
    } = source.source
    return fileRequests(api!, filter, mapping, id, dynamicMapping!, noUseMapping)
}

/** 解析Excel */
export const parseExcel = (source: any, id: string, noUseMapping: boolean) => {
    const {
        api,
        filter,
        mapping,
        dynamicMapping
    } = source.source
    return fileRequests(api!, filter, mapping, id, dynamicMapping!, noUseMapping)
}