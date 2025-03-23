import { useProcessData } from './useMapping'

export const parseStaticData = (source: any, id: string, noUseMapping: boolean) => {
    return new Promise(function (resolve, reject) {
        if (source.source.static !== undefined) {
            useProcessData(source.source.filter, source.source.static, source.source.mapping, id, source.source.dynamicMapping, noUseMapping).then(response => {
                resolve(response)
            }).catch(() => {
                resolve([])
            })
        } else {
            resolve([])
        }
    })
}