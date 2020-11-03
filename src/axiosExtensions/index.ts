import { cancelAllAxios, cancelableAxios, isCancel } from './cancelableAxios';
import { notRepeatableAxios, deleteRequestingAxios } from './notRepeatableAxios';
import isRepeatSubmit from '../utils/isRepeatSubmit';
import { cacheableAxios, deleteCacheItem } from './cacheableAxios';

export default {
    cancelableAxios,
    cancelAllAxios,
    isCancel,
    notRepeatableAxios,
    deleteRequestingAxios,
    isRepeatSubmit,
    cacheableAxios,
    deleteCacheItem,
};
