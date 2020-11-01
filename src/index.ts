import cacheableAxios from './axios/cacheableAxios';
import { cancelAllAxios, cancelableAxios, isCancelAxios } from './axios/cancelableAxios';
import { notRepeatableAxios, deleteRequestingAxios } from './axios/notRepeatableAxios';
import cacheableFetch from './fetch/cacheableFetch';
import { cancelAllFetch, cancelableFetch, isCancelFetch } from './fetch/cancelableFetch';
import { notRepeatableFetch, deleteRequestingFetch } from './fetch/notRepeatableFetch';
import isRepeatSubmit from './utils/isRepeatSubmit';

export const axiosExt = {
    cacheableAxios,
    cancelAllAxios,
    cancelableAxios,
    isCancel: isCancelAxios,
    notRepeatableAxios,
    deleteRequestingAxios,
    isRepeatSubmit,
};

export const fetchExt = {
    cacheableFetch,
    cancelAllFetch,
    cancelableFetch,
    isCancel: isCancelFetch,
    notRepeatableFetch,
    deleteRequestingFetch,
    isRepeatSubmit,
};

const requestExt = { axiosExt, fetchExt }

export default requestExt