import getAbsoluteUrl from '../utils/getAbsoluteUrl';
import isEqual from 'lodash.isequal';
import getRequestParams from '../utils/getRequestParams';
import addCacheItem from '../utils/addCacheItem';
import { ICacheItem, ICacheableOptions } from '../types';

// 用于缓存的数组
let cachePool: ICacheItem[] = [];
// 可缓存的 fetch 请求
export default function cacheableFetch(fetch: any, options?: ICacheableOptions) {
    return (endpoint: string, fetchOptions: any): any => {
        const { method, body, cacheable, forceUpdate } = fetchOptions;
        // 不能缓存
        if (!cacheable) {
            return fetch(endpoint, fetchOptions);
        }
        // 把完整的请求地址作为暂存的key
        const urlKey = getAbsoluteUrl(endpoint);
        // post 请求的请求参数
        let postData = {}
        try {
            postData = JSON.parse(body || '{}')
        } catch(e) {
            postData = {}
            console.log(`缓存参数解析出错：${urlKey}`)
        }
        // 请求参数，用于判断是否使用缓存
        const requestParams = getRequestParams(endpoint, method, postData);
        // 取缓存
        const cache: ICacheItem | undefined = cachePool.find(item => item.urlKey === urlKey);
        if (!forceUpdate && cache && isEqual(requestParams, cache.params) && Date.now() < cache.expireTime) {
            const msg = `缓存数据已经存在，直接取缓存数据：${urlKey}`;
            console.log(msg, cache.responsePromise);
            return cache.responsePromise;
        }
        // 发起请求
        const responsePromise: Promise<any> = fetch(endpoint, fetchOptions).then((response: any) => {
            console.log('fetch raw response', response);
            if (response.ok) {
                // fetch 的返回结果的 body（ReadableStream）数据只能读取一次（用 bodyUsed 标志是否使用），所以要复制
                const cloneRes = response.clone();
                cloneRes.json().then((responseData: any) => {
                    const { isNeedCache } = options || {};
                    // 通过 isNeedCache 方法判断是否需要缓存
                    if (isNeedCache && isNeedCache(responseData)) {
                        cachePool = addCacheItem({ cachePool, urlKey, options, requestParams, responsePromise });
                    }
                });
            }
            return response;
        });
        return responsePromise;
    };
}
