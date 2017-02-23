import { wxeapi } from '../../config';
import cacheProxy from './memory-cache-proxy';

export const getTagList = (...args) => {
  const cacheOption = {
    key: 'wxe:tagList',
    expire: 5 * 60 * 1000, // five minutes
    ...args.slice(0, -1),
  };
  return cacheProxy(wxeapi.getTagList.bind(wxeapi), cacheOption, []);
};

export const getTag = (tagid, options = {}) => {
  const cacheOption = {
    key: `wxe:tag:${tagid}`,
    expire: 60 * 60 * 1000, // one hour
    ...options,
  };
  return cacheProxy(wxeapi.getTag.bind(wxeapi), cacheOption, [tagid]);
};
