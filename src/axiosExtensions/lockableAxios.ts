import { AxiosAdapter } from 'axios';
import getAbsoluteUrl from '../utils/getAbsoluteUrl';
import { IAxiosRequestConfigExtend, IRequestingUrls } from '../types';

// 保存未完成的请求地址
const requestingUrls: IRequestingUrls = {};
// 删除完成的请求
export function deleteLockedUrl(url: string): void {
    const urlKey = getAbsoluteUrl(url);
    delete requestingUrls[urlKey];
}
// 不能重复提交
export function lockableAxios(adapter: AxiosAdapter): AxiosAdapter {
    return (config: IAxiosRequestConfigExtend): Promise<any> => {
        const { url, lockable, isEnqueueSubmit } = config;
        // 请求地址
        const key: string = getAbsoluteUrl(url || '');
        // 支持重复的请求
        if (!lockable) {
            return adapter(config);
        }
        if (requestingUrls[key]) {
            const message = `请不要重复提交表单：${key}`;
            if (process.env.NODE_ENV === 'development') {
                console.log(`【request-extensions】${message}`);
            }
            return Promise.reject({ __IS_REPEAT_SUBMIT__: true, message });
        }
        requestingUrls[key] = true;
        return adapter(config).finally(() => {
            if (!isEnqueueSubmit) {
                deleteLockedUrl(key);
            }
        });
    };
}
