import getAbsoluteUrl from '../utils/getAbsoluteUrl';
import { IRequestingUrls } from '../types'

// 保存未完成的请求地址
const requestingUrls: IRequestingUrls = {};
// 删除完成的请求
export function deleteLockedUrl(url: string): void {
    const urlKey = getAbsoluteUrl(url);
    delete requestingUrls[urlKey];
}
// 不能重复提交
export function lockableFetch(fetch: any) {
    return (endpoint: string, fetchOptions: any): Promise<any> => {
        const { lockable, isEnqueueSubmit } = fetchOptions;
        // 请求地址
        const key: string = getAbsoluteUrl(endpoint);
        // 支持重复的请求
        if (!lockable) {
            return fetch(endpoint, fetchOptions);
        }
        if (requestingUrls[key]) {
            const message = `请不要重复提交表单：${key}`;
            return Promise.reject({ __IS_REPEAT_SUBMIT__: true, message });
        }
        requestingUrls[key] = true;
        return fetch(endpoint, fetchOptions).finally(() => {
            if (!isEnqueueSubmit) {
                deleteLockedUrl(key);
            }
        });
    };
}
