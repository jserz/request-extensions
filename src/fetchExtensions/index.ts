import { cancelAllFetch, cancelableFetch, isCancel } from './cancelableFetch';
import { notRepeatableFetch, deleteRequestingFetch } from './notRepeatableFetch';
import { cacheableFetch, deleteCacheItem } from './cacheableFetch';
import isRepeatSubmit from '../utils/isRepeatSubmit';

export default {
    cancelableFetch,
    cancelAllFetch,
    isCancel,
    notRepeatableFetch,
    deleteRequestingFetch,
    isRepeatSubmit,
    cacheableFetch,
    deleteCacheItem,
};
