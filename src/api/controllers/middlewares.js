/*
eslint-disable no-console, no-param-reassign, no-shadow
 */

import fetch from 'node-fetch';
import cache from 'memory-cache';
import { SERVER_FAILED } from 'nagu-validates';
import { YktManager } from 'ecard-api';
import { auth, wxeapi, error, info, mysqlUrl,
  ecardApiHost as apiHost, TAG_LIST, CACHE_TIME_10_DAYS } from '../../config';

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

/*
fetchShopBill({ getShopId, getAccDate, cacheKey, cacheTime, success, fail }): Middleware
获取指定日期的商户账单

- 参数
  - getShopId(req, res) 用于获取shopId的方法，默认由req.params.shopId获取；
  - getAccDate(req, res) 用于获取accDate的方法，默认由req.params.accDate获取；
  - cacheKey 缓存的Key，默认为`ecard-wxe:shopBill:{shopId}:{accDate}`；
  - cacheTime 缓存时间，单位为ms，默认为10天；
  - success 执行成功时的回调，默认将获取到的数据设置到`req.shopBill`然后转向下一个中间件；
  - fail 执行失败时的回调，默认向客户端返回错误信息。
 */
export const fetchShopBill = (options = {}) => async (req, res, next) => {
  let { getShopId, getAccDate, cacheKey, cacheTime, success, fail } = options;

  // 设置参数
  getShopId = getShopId || (req => req.params.shopId);
  getAccDate = getAccDate || (req => req.params.accDate);

  const shopId = getShopId(req, res);
  const accDate = getAccDate(req, res);

  cacheKey = cacheKey || `ecard-wxe:shopBill:${shopId}:${accDate}`;
  cacheTime = cacheTime || CACHE_TIME_10_DAYS;
  success = success || ((bill, req, res, next) => {
    res.shopBill = bill;
    next();
  });
  fail = fail || ((e, req, res) => res.send({
    ret: SERVER_FAILED,
    msg: e.message,
  }));

  try {
    info('start to fetchShopBill');
    let bill = cache.get(cacheKey);

    // 缓存中没有数据，从远程获取
    if (!bill) {
      info(' fetch shopBill from cache failed. cacheKey:', cacheKey);
      info('fetch shop bill from remote');
      const shopBillUrl = `${apiHost}/shop/${shopId}/daily-bill/${accDate}?token=${auth.ecardApiToken}`;
      const shopBillResult = await (await fetch(shopBillUrl)).json();

      // 远处获取数据成功
      if (shopBillResult.ret === 0) {
        bill = shopBillResult.data;
        cache.put(cacheKey, bill, cacheTime);
      } else {
        error('读取当前商户账单失败, shopId:', shopId, 'accDate:', accDate);
        error('Result:', shopBillResult);
        throw new Error('读取当前商户账单失败');
      }
    }
    info('fetchShopBill is done');
    success(bill, req, res, next);
  } catch (e) {
    error('读取当前商户账单失败, shopId:', shopId, 'accDate:', accDate);
    error(e.message);
    error(e.stack);
    fail(e, req, res, next);
  }
};

/*
fetchAncestorShops({ getShopId, cacheKey, cacheTime, success, fail }): Middleware
获取指定日期的商户账单

- 参数
  - getShopId(req, res) 用于获取shopId的方法，默认由req.params.shopId获取；
  - cacheKey 缓存的Key，默认为`ecard-wxe:shop:ancestors:{shopId}`；
  - cacheTime 缓存时间，单位为ms，默认为10天；
  - success 执行成功时的回调，默认将获取到的数据设置到`req.ancestorShops`然后转向下一个中间件；
  - fail 执行失败时的回调，默认向客户端返回错误信息。
 */
export const fetchAncestorShops = (options = {}) => async (req, res, next) => {
  let { getShopId, cacheKey, cacheTime, success, fail } = options;

   // 设置参数
  getShopId = getShopId || (req => req.params.shopId);

  const shopId = getShopId(req, res);

  cacheKey = cacheKey || `ecard-wxe:shop:ancestors:${shopId}`;
  cacheTime = cacheTime || 10 * 24 * 60 * 60 * 1000;
  success = success || ((shops, req, res, next) => {
    res.ancestorShops = shops;
    next();
  });
  fail = fail || ((e, req, res) => res.send({
    ret: SERVER_FAILED,
    msg: e.message,
  }));

  try {
    info('start to fetchAncestorShops');
    let shops = cache.get(cacheKey);

     // 缓存中没有数据，从远程获取
    if (!shops) {
      info(' fetch ancestorShops from cache failed. cacheKey:', cacheKey);
      info('fetch ancestorShops from remote');

      const yktManager = new YktManager({ url: mysqlUrl });
      shops = await yktManager.getAncestorShops(shopId);
      cache.put(cacheKey, shops, cacheTime);
    }
    info('fetchAncestorShops is done');
    success(shops, req, res, next);
  } catch (e) {
    error('读取当前商户祖先节点失败, shopId:', shopId);
    error(e.message);
    error(e.stack);
    fail(e, req, res, next);
  }
};
