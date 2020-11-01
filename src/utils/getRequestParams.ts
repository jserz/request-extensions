import parse from 'url-parse';

export default function getRequestParams(url: string, method: string, postData: any, params?: any): any {
    const parseUrlObj: parse = parse(url);
    const queryParams = { ...parseUrlObj.query, ...(params || {}) };
    const requestParams = method.toLowerCase() === 'get' ? queryParams : postData;
    return requestParams;
}
