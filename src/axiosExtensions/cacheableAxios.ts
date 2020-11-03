import { AxiosAdapter, AxiosPromise, AxiosResponse } from 'axios';
import isEqual from 'lodash.isequal';
import getAbsoluteUrl from '../utils/getAbsoluteUrl';
import transformData from '../utils/transformData';
import addCacheItem from '../utils/addCacheItem';
import getRequestParams from '../utils/getRequestParams';
import { ICacheItem, ICacheableOptions, IAxiosRequestConfigExtend } from '../types';
import deleteCache from '../utils/deleteCacheItem'

// 用于缓存的数组
let cachePool: ICacheItem[] = [];
// 删除缓存项
export function deleteCacheItem(url: string): void {
    const urlKey: string = getAbsoluteUrl(url || '');
    deleteCache(cachePool, urlKey)
}
// 可缓存的 axios 请求
export function cacheableAxios(adapter: AxiosAdapter, options?: ICacheableOptions): AxiosAdapter {
    return (config: IAxiosRequestConfigExtend): AxiosPromise<any> => {
        const { url, method = 'get', cacheable, forceUpdate, params, data } = config;
        // 不能缓存，则直接返回
        if (!cacheable) {
            return adapter(config);
        }
        // 把完整的请求地址作为暂存的 key
        const urlKey: string = getAbsoluteUrl(url || '');
        // 请求参数，用于判断是否使用缓存
        const requestParams: any = getRequestParams(url || '', method, data, params);
        // 取缓存
        const cache: ICacheItem | undefined = cachePool.find(item => item.urlKey === urlKey);
        if (!forceUpdate && cache && isEqual(requestParams, cache.params) && Date.now() < cache.expireTime) {
            const msg = `缓存数据已经存在，直接取缓存数据：${urlKey}`;
            console.log(msg);
            return cache.responsePromise;
        }
        // 发起请求
        const responsePromise: AxiosPromise<any> = adapter(config).then((response: AxiosResponse<any>) => {
            // 转换响应数据
            const responseData: any = transformData(response.data, response.headers, response.config.transformResponse);
            const { isNeedCache } = options || {};
            // 通过 isNeedCache 方法判断是否需要缓存
            if (isNeedCache && isNeedCache(responseData)) {
                cachePool = addCacheItem({ cachePool, urlKey, options, requestParams, responsePromise });
            }
            return response;
        });
        return responsePromise;
    };
}
