/*
eslint-disable no-console, no-param-reassign, no-shadow
 */

import cache from 'memory-cache';
import { SERVER_FAILED } from 'nagu-validates';
import { wxeapi, error, info, TAG_LIST, CACHE_TIME_10_DAYS } from '../../config';

/*
getTagList({ cacheKey, cacheTime, success, fail }): Middleware
获取tag列表

- 参数
  - cacheKey 缓存的Key，默认为`wxeapi:getTagList`；
  - cacheTime 缓存时间，单位为ms，默认为10天；
  - success 执行成功时的回调，默认将获取的数据设置到`req.tagList`然后转向下一个中间件；
  - fail 执行失败时的回调，默认向客户端返回错误信息。
 */
export const getTagList = (options = {}) => async (req, res, next) => {
  let { success, fail, cacheKey, cacheTime } = options;

  // 设置参数
  success = success || ((tagList, req, res, next) => {
    req.tagList = tagList;
    next();
  });
  fail = fail || ((e, req, res) => res.send({
    ret: SERVER_FAILED,
    msg: e.message,
  }));
  cacheKey = cacheKey || TAG_LIST;
  cacheTime = cacheTime || CACHE_TIME_10_DAYS;
  try {
    info('start to getTagList');
    let tagList = cache.get(cacheKey);
    if (!tagList) {
      tagList = await wxeapi.getTagList();
      cache.put(cacheKey, tagList, cacheTime);
    }
    info('getTagList is done');
    success(tagList, req, res, next);
  } catch (e) {
    error('getTagList Error', e.message);
    error(e.stack);
    fail(e, req, res, next);
  }
};
