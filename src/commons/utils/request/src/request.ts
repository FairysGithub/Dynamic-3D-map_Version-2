import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { merge } from 'lodash'

export type RestResult<T> = {
    code: number,
    msg: string,
    data?: T
}

export enum IContentType {
    FormData = 'multipart/form-data',
    UrlEncoded = 'application/x-www-form-urlencoded; charset=UTF-8',
    Json = 'application/json; charset=UTF-8',
    Raw = 'raw' // 注意：这里'raw'不是一个标准的MIME类型，用于表示非特定类型的原始数据
}

export class HttpRequest {
    public instance: AxiosInstance

    constructor() {
        this.instance = axios.create()
    }

    /**
     * GET 请求
     * @param url
     * @param config
     * @returns
     */
    public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<RestResult<T>> {
        return this.instance.get(url, config)
    }

    /**
     * POST 请求
     * @param url 请求的URL
     * @param data 发送的数据
     * @param contentType 数据的内容类型
     * @param config 额外的Axios配置
     * @returns
     */
    public post<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig,
        contentType: IContentType = IContentType.Json
    ): Promise<RestResult<T>> {
        const defaultConfig: AxiosRequestConfig = {
            headers: {
                'Content-Type': IContentType.Json
            }
        }

        if (contentType === IContentType.FormData) {
            // FormData 类型的请求通常不需要设置 Content-Type，因为浏览器会自动设置
            defaultConfig.headers = {}
            const formData = new FormData() // 注意：这里需要确保 data 是 FormData 类型
            for (const key in data) {
                formData.append(key, data[key])
            }
            data = formData
        } else if (contentType === IContentType.UrlEncoded) {
            defaultConfig.headers!['Content-Type'] = IContentType.UrlEncoded
            defaultConfig.transformRequest = [(data) => {
                // 将对象转换为 URL 编码的字符串
                const formData = new URLSearchParams()
                for (const key in data) {
                    formData.append(key, data[key])
                }
                return formData.toString()
            }]
        }

        return this.instance.post(url, data, merge({}, defaultConfig, config))
    }

    /**
     * PUT 请求
     * @param url
     * @param data
     * @param config
     * @returns
     */
    public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig, contentType: IContentType = IContentType.UrlEncoded): Promise<RestResult<T>> {
        const defaultConfig: AxiosRequestConfig = {
            headers: {
                'Content-Type': contentType
            }
        }

        if (contentType === IContentType.FormData) {
            // FormData 类型的请求通常不需要设置 Content-Type，因为浏览器会自动设置
            defaultConfig.headers = {}
            const formData = new FormData() // 注意：这里需要确保 data 是 FormData 类型
            for (const key in data) {
                formData.append(key, data[key])
            }
            data = formData
        } else if (contentType === IContentType.UrlEncoded) {
            defaultConfig.headers!['Content-Type'] = IContentType.UrlEncoded
            defaultConfig.transformRequest = [(data) => {
                // 将对象转换为 URL 编码的字符串
                const formData = new URLSearchParams()
                for (const key in data) {
                    formData.append(key, data[key])
                }
                return formData.toString()
            }]
        }

        return this.instance.put(url, data, merge({}, defaultConfig, config))
    }

    /**
     * DELETE 请求
     * @param url
     * @param config
     * @returns
     */
    public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<RestResult<T>> {
        const defaultConfig: AxiosRequestConfig = {
            headers: {
                'Content-Type': IContentType.UrlEncoded
            }
        }
        return this.instance.delete(url, merge({}, defaultConfig, config))
    }

    /**
     * 文件上传
     * @param url
     * @param params
     * @param config
     * @returns
     */
    public upload<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<RestResult<T>> {
        const defaultConfig: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
        return this.instance.post(url, params, config || defaultConfig)
    }

    /**
     * blob文件下载
     * @param url
     * @param params
     * @param config
     * @returns
     */
    public download<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<RestResult<T>> {
        const defaultConfig: AxiosRequestConfig = {
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json'
            }
        }
        return this.instance.post(url, params, config || defaultConfig)
    }

    /**
     * Custom 请求
     * @param url
     * @param config
     * @returns
     */
    public custom<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.get(url, config)
    }
}