import { wxeapi } from '../../config';
import cacheProxy from './memory-cache-proxy';

export const getTagList = (...args) => {
  const cacheOption = {
    key: 'wxe:tagList',
    expire: 5 * 60 * 1000, // five minutes
    ...args.slice(0, -1),
  };
  cacheProxy(wxeapi.getTagList, [], cacheOption);
};

export const getTag = (tagid, options = {}) => {
  const cacheOption = {
    key: `wxe:tag:${tagid}`,
    expire: 60 * 60 * 1000, // one hour
    ...options,
  };
  cacheProxy(wxeapi.getTag, [tagid], cacheOption);
};
