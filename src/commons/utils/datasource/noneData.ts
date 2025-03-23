export const noneData = (id: string) => {
    return {
        id,
        finalKeyData: [],
        finalUserData: { id, data: [] },
        filteredData: [],
        rawData: [],
        noMappingData: []
    }
}