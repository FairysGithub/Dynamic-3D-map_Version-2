import { storeToRefs } from 'pinia'
import { usePageStore } from '../../stores/pageStore'
import { useProcessData } from './useMapping'

import pinia from '../piniaInstance'
import { noneData } from './noneData'

const pageStore = usePageStore(pinia)
const { currentPage } = storeToRefs(pageStore)

export const parseVariableData = (source: any, id: string, noUseMapping: boolean) => {
    return new Promise(function (resolve, reject) {
        const currentVariableData = currentPage.value.variableData.find(i => (i.id === source.source.variableId || i.name === source.source.variableId))
        if (currentVariableData) {
            useProcessData(source.source.filter, currentVariableData._value, source.source.mapping, id, source.source.dynamicMapping, noUseMapping).then(response => {
                resolve(response)
            }).catch(() => {
                resolve(noneData(id))
            })
        } else {
            resolve(noneData(id))
        }
    })
}