/*
eslint-disable no-console, no-param-reassign, no-shadow
 */

import cache from 'memory-cache';
import { SERVER_FAILED } from 'nagu-validates';
import { wxeapi, error, info,
  TAG_LIST, CACHE_TIME_10_DAYS } from '../../config';
import * as shopModel from '../models/cachedShop';

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
  - cacheOptions 缓存选项
    - key 缓存的Key，默认为`ecard-wxe:shopBill:{shopId}:{accDate}`；
    - expire 缓存时间，单位为ms，默认为10天；
  - success 执行成功时的回调，默认将获取到的数据设置到`req.shopBill`然后转向下一个中间件；
  - fail 执行失败时的回调，默认向客户端返回错误信息。
 */
export const fetchShopBill = (options = {}) => async (req, res, next) => {
  let { getShopId, getAccDate, cacheOptions, success, fail } = options;

  // 设置参数
  getShopId = getShopId || (req => req.params.shopId);
  getAccDate = getAccDate || (req => req.params.accDate);

  const shopId = getShopId(req, res);
  const accDate = getAccDate(req, res);

  cacheOptions = {
    key: `ecard-wxe:shopBill:${shopId}:${accDate}`,
    expire: CACHE_TIME_10_DAYS,
    ...cacheOptions,
  };

  success = success || ((bill, req, res, next) => {
    res.shopBill = bill;
    next();
  });
  fail = fail || ((e, req, res) => res.send({
    ret: SERVER_FAILED,
    msg: e.message,
  }));

  try {
    const bill = await shopModel.fetchDailyBill(shopId, accDate, cacheOptions);
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
  - cacheOptions 缓存选项
    - key 缓存的Key，默认为`ecard-wxe:shop:ancestors:{shopId}`；
    - expire 缓存时间，单位为ms，默认为10天；
  - success 执行成功时的回调，默认将获取到的数据设置到`req.ancestorShops`然后转向下一个中间件；
  - fail 执行失败时的回调，默认向客户端返回错误信息。
 */
export const fetchAncestorShops = (options = {}) => async (req, res, next) => {
  let { getShopId, cacheOptions, success, fail } = options;

   // 设置参数
  getShopId = getShopId || (req => req.params.shopId);

  const shopId = getShopId(req, res);

  cacheOptions = {
    key: `ecard-wxe:shop:ancestors:${shopId}`,
    expire: CACHE_TIME_10_DAYS,
    ...cacheOptions,
  };
  success = success || ((shops, req, res, next) => {
    res.ancestorShops = shops;
    next();
  });
  fail = fail || ((e, req, res) => res.send({
    ret: SERVER_FAILED,
    msg: e.message,
  }));

  try {
    const shops = await shopModel.fetchAncestorShops(shopId, cacheOptions);
    success(shops, req, res, next);
  } catch (e) {
    error('读取当前商户祖先节点失败, shopId:', shopId);
    error(e.message);
    error(e.stack);
    fail(e, req, res, next);
  }
};

export const fetchSubShopDailyBills = (options = {}) => async (req, res, next) => {
  let { getFShopId, getAccDate, cacheOptions, success, fail } = options;

  // 设置参数
  getFShopId = getFShopId || (req => req.params.shopId);
  getAccDate = getAccDate || (req => req.params.accDate);

  const fShopId = getFShopId(req, res);
  const accDate = getAccDate(req, res);

  cacheOptions = {
    key: `ecard-wxe:subShopBills:${fShopId}:${accDate}`,
    expire: CACHE_TIME_10_DAYS,
    ...cacheOptions,
  };

  success = success || ((bills, req, res, next) => {
    res.subShopBills = bills;
    next();
  });
  fail = fail || ((e, req, res) => res.send({
    ret: SERVER_FAILED,
    msg: e.message,
  }));

  try {
    const bills = await shopModel.fetchSubShopDailyBills(fShopId, accDate, cacheOptions);
    success(bills, req, res, next);
  } catch (e) {
    error('读取子商户账单失败, fShopId:', fShopId, 'accDate:', accDate);
    error(e.message);
    error(e.stack);
    fail(e, req, res, next);
  }
};

export const fetchDeviceDailyBills = (options = {}) => async (req, res, next) => {
  let { getShopId, getAccDate, cacheOptions, success, fail } = options;

  // 设置参数
  getShopId = getShopId || (req => req.params.shopId);
  getAccDate = getAccDate || (req => req.params.accDate);

  const shopId = getShopId(req, res);
  const accDate = getAccDate(req, res);

  cacheOptions = {
    key: `ecard-wxe:deviceDailyBills:${shopId}:${accDate}`,
    expire: CACHE_TIME_10_DAYS,
    ...cacheOptions,
  };

  success = success || ((bills, req, res, next) => {
    res.deviceBills = bills;
    next();
  });
  fail = fail || ((e, req, res) => res.send({
    ret: SERVER_FAILED,
    msg: e.message,
  }));

  try {
    const bills = await shopModel.fetchDeviceDailyBills(shopId, accDate, cacheOptions);
    success(bills, req, res, next);
  } catch (e) {
    error('读取设备日账单列表失败, shopId:', shopId, 'accDate:', accDate);
    error(e.message);
    error(e.stack);
    fail(e, req, res, next);
  }
};
