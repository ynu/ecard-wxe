/*
eslint-disable no-console, no-param-reassign, no-shadow
 */

import cache from 'memory-cache';
import { SERVER_FAILED } from 'nagu-validates';
import { wxeapi, error, info,
  TAG_LIST, getShopBillCacheKey, getShopAncestorsCacheKey,
getSubShopBillsCacheKey } from '../../config';
import * as shopModel from '../models/cachedShop';

const TEN_DAYS = 10 * 24 * 60 * 60 * 1000;

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
  cacheTime = cacheTime || TEN_DAYS;
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
    key: getShopBillCacheKey(shopId, accDate),
    expire: TEN_DAYS,
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
    key: getShopAncestorsCacheKey(shopId),
    expire: TEN_DAYS,
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

/*
fetchSubShopDailyBills({ getFShopId, getAccDate, cacheOptions, success, fail })
指定父商户Id和账单日期，获取所有子商户的日账单列表


- 参数
  - getFShopId(req, res) 用于获取fShopId的方法，默认由req.params.shopId获取；
  - getAccDate(req, res) 用于获取accDate的方法，默认由req.params.accDate获取；
  - cacheOptions 缓存选项
    - key 缓存的Key，默认为`ecard-wxe:shopBill:{shopId}:{accDate}`；
    - expire 缓存时间，单位为ms，默认为10天；
  - success 执行成功时的回调，默认将获取到的数据设置到`req.shopBill`然后转向下一个中间件；
  - fail 执行失败时的回调，默认向客户端返回错误信息。
 */
export const fetchSubShopDailyBills = (options = {}) => async (req, res, next) => {
  let { getFShopId, getAccDate, cacheOptions, success, fail } = options;

  // 设置参数
  getFShopId = getFShopId || (req => req.params.shopId);
  getAccDate = getAccDate || (req => req.params.accDate);

  const fShopId = getFShopId(req, res);
  const accDate = getAccDate(req, res);

  cacheOptions = {
    key: `ecard-wxe:subShopBills:${fShopId}:${accDate}`,
    expire: TEN_DAYS,
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
    expire: TEN_DAYS,
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

/*
fetchShopMonthlyBill({ getShopId, getAccDate, cacheKey, cacheTime, success, fail }): Middleware
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
export const fetchShopMonthlyBill = (options = {}) => async (req, res, next) => {
  let { getShopId, getAccDate, cacheOptions, success, fail } = options;

   // 设置参数
  getShopId = getShopId || (req => req.params.shopId);
  getAccDate = getAccDate || (req => req.params.accDate);

  const shopId = getShopId(req, res);
  const accDate = getAccDate(req, res);

  cacheOptions = {
    key: getShopBillCacheKey(shopId, accDate),
    expire: TEN_DAYS,
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
    const bill = await shopModel.fetchShopMonthlyBill(shopId, accDate, cacheOptions);
    success(bill, req, res, next);
  } catch (e) {
    error('读取当前商户月账单失败, shopId:', shopId, 'accDate:', accDate);
    error(e.message);
    error(e.stack);
    fail(e, req, res, next);
  }
};

/*
fetchSubShopMonthlyBills({ getFShopId, getAccDate, cacheOptions, success, fail })
指定父商户Id和账单日期，获取所有子商户的月账单列表


- 参数
  - getFShopId(req, res) 用于获取fShopId的方法，默认由req.params.shopId获取；
  - getAccDate(req, res) 用于获取accDate的方法，默认由req.params.accDate获取；
  - cacheOptions 缓存选项
    - key 缓存的Key，默认为`ecard-wxe:shopBill:{shopId}:{accDate}`；
    - expire 缓存时间，单位为ms，默认为10天；
  - success 执行成功时的回调，默认将获取到的数据设置到`req.shopBill`然后转向下一个中间件；
  - fail 执行失败时的回调，默认向客户端返回错误信息。
 */
export const fetchSubShopMonthlyBills = (options = {}) => async (req, res, next) => {
  let { getFShopId, getAccDate, cacheOptions, success, fail } = options;

  // 设置参数
  getFShopId = getFShopId || (req => req.params.shopId);
  getAccDate = getAccDate || (req => req.params.accDate);

  const fShopId = getFShopId(req, res);
  const accDate = getAccDate(req, res);

  cacheOptions = {
    key: getSubShopBillsCacheKey(fShopId, accDate),
    expire: TEN_DAYS,
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
    const bills = await shopModel.fetchSubShopMonthlyBills(fShopId, accDate, cacheOptions);
    success(bills, req, res, next);
  } catch (e) {
    error('读取子商户账单失败, fShopId:', fShopId, 'accDate:', accDate);
    error(e.message);
    error(e.stack);
    fail(e, req, res, next);
  }
};

export const fetchOperatorBills = (options = {}) => async (req, res, next) => {
  let { getAccDate, success, fail } = options;

  // 设置参数
  getAccDate = getAccDate || (req => req.params.accDate);
  const accDate = getAccDate(req, res);

  success = success || ((bills, req, res, next) => {
    res.data = bills;
    next();
  });
  fail = fail || ((e, req, res) => res.send({
    ret: SERVER_FAILED,
    msg: e.message,
  }));

  try {
    const bills = await shopModel.fetchOperatorBills(accDate);

    // 将账单按操作员进行分组
    const groupByName = bills.reduce((acc, cur) => {
      if (!acc[cur.operName]) acc[cur.operName] = [];
      acc[cur.operName].push({
        operName: cur.operName,
        accDate: cur.accDate,
        inAmt: parseInt(cur.inAmt, 10),
        outAmt: parseInt(cur.outAmt, 10),
        transCnt: parseInt(cur.transCnt, 10),
        subjName: cur.subjName,
        summary: cur.summary,
      });
      return acc;
    }, {});
    success(groupByName, req, res, next);
  } catch (e) {
    error('读取操作员账单失败, accDate:', accDate);
    error(e.message);
    fail(e, req, res, next);
  }
};
