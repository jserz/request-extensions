import 'yet-another-abortcontroller-polyfill';
import getAbsoluteUrl from '../utils/getAbsoluteUrl';
import { v4 as uuidv4 } from 'uuid'
import { ICancelMap } from '../types'

// 保存未完成的请求的取消对象
const fetchCancelMap: ICancelMap = {};
// 取消未完成的请求
function cancelFetch(key: string): void {
    if (fetchCancelMap[key]) {
        fetchCancelMap[key].abort();
        if (process.env.NODE_ENV === 'development') {
            console.log(`【request-extensions】请求已被取消：${key}`);
        }
        delete fetchCancelMap[key];
    }
}
// 取消所有的请求，一般用于路由切换时，取消前一个路由未完成的请求
export function cancelAllFetch(): void {
    const ajaxKeys = Object.keys(fetchCancelMap);
    ajaxKeys.forEach(key => {
        cancelFetch(key);
    });
}

//判断请求是否被取消
export function isCancel(value: any) {
    return !!(value && value.name === 'AbortError')
}

// 可取消的请求
export function cancelableFetch(fetch: any): any {
    return (endpoint: string, fetchOptions: any): Promise<any> => {
        const { cancelable, onlySwitchRouteCancelable } = fetchOptions;
        // 不支持取消的请求
        if (!cancelable && !onlySwitchRouteCancelable) {
            return fetch(endpoint, fetchOptions);
        }
        let key: string = getAbsoluteUrl(endpoint);
        // 只有切换路由时才可以取消
        if (!cancelable && onlySwitchRouteCancelable) {
            key = `${key}-${uuidv4()}`;
        }
        // 取消未完成的请求
        cancelFetch(key);
        const controller = new AbortController();
        fetchCancelMap[key] = controller;
        fetchOptions.signal = controller.signal;
        return fetch(endpoint, fetchOptions).finally(() => {
            delete fetchCancelMap[key];
        });
    };
}
