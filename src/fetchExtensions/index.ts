import { cancelAllFetch, cancelableFetch, isCancel } from './cancelableFetch';
import { lockableFetch, deleteLockedUrl } from './lockableFetch';
import { cacheableFetch, deleteCacheItem } from './cacheableFetch';
import isRepeatSubmit from '../utils/isRepeatSubmit';

export default {
    cancelableFetch,
    cancelAllFetch,
    isCancel,
    lockableFetch,
    deleteLockedUrl,
    isRepeatSubmit,
    cacheableFetch,
    deleteCacheItem,
};
