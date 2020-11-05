import { cancelAllAxios, cancelableAxios, isCancel } from './cancelableAxios';
import { lockableAxios, deleteLockedUrl } from './lockableAxios';
import isRepeatSubmit from '../utils/isRepeatSubmit';
import { cacheableAxios, deleteCacheItem } from './cacheableAxios';

export default {
    cancelableAxios,
    cancelAllAxios,
    isCancel,
    lockableAxios,
    deleteLockedUrl,
    isRepeatSubmit,
    cacheableAxios,
    deleteCacheItem,
};
