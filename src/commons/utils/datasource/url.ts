import router from '@/commons/router'

import { useProcessData } from './useMapping'
import { noneData } from './noneData'

export const parseUrlData = (source: any, id: string, noUseMapping: boolean) => {
    return new Promise(function (resolve, reject) {
        const query = router.currentRoute.value.query

        if (query !== undefined) {
            useProcessData(source.source.filter, query, source.source.mapping, id, source.source.dynamicMapping, noUseMapping).then(response => {
                resolve(response)
            }).catch(() => {
                resolve(noneData(id))
            })
        } else {
            resolve(noneData(id))
        }
    })
}