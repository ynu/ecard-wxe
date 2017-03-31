/*
Shop模型的Proxy方法，使用memory-cache 做了缓存处理。
每个proxy方法最后一个参数都是CacheOptions，包含key和expire两个参数，其余参数与Shop模型中的方法一致。
 */

import * as model from './shop';
import cacheProxy from './memory-cache-proxy';

const getCacheOptions = (name) => {
  const TEN_DAYS = 10 * 24 * 3600 * 1000;
  return {
    key: `ecard-wxe:shop:${name}`,
    expire: TEN_DAYS,
  };
};


/*
fetchShopBill(shopId, sccDate, {key, expire }): ShopBill
获取指定日期的商户账单
 */
export const fetchDailyBill = (...args) =>
  cacheProxy(model.fetchDailyBill, args[args.length - 1], args.slice(0, -1));

export const fetchAncestorShops = (...args) =>
  cacheProxy(model.fetchAncestorShops, args[args.length - 1], args.slice(0, -1));


export const fetchSubShopDailyBills = (...args) =>
  cacheProxy(model.fetchSubShopDailyBills, args[args.length - 1], args.slice(0, -1));

export const fetchDeviceDailyBills = (...args) =>
  cacheProxy(model.fetchDeviceDailyBills, args[args.length - 1], args.slice(0, -1));


export const fetchShops = (...args) =>
  cacheProxy(model.fetchShops, args[args.length - 1], args.slice(0, -1));

// export const fetchShopDailyBills = (...args) =>
//   cacheProxy(model.fetchShopDailyBills, args[args.length - 1], args.slice(0, -1));

export const fetchShopMonthlyBill = (...args) =>
  cacheProxy(model.fetchMonthlyBill, args[args.length - 1], args.slice(0, -1));

export const fetchSubShopMonthlyBills = (...args) =>
    cacheProxy(model.fetchSubShopMonthlyBills, args[args.length - 1], args.slice(0, -1));

export const fetchOperatorBills = (...args) =>
    cacheProxy(model.fetchOperatorBills, getCacheOptions(`operatorBills${JSON.stringify(args)}`), args);
