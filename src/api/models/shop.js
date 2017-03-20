/*
由远程服务器读取Shop相关数据
 */

import fetch from 'node-fetch';
import { auth, error, info, ecardApiHost, rootShopId } from '../../config';

/*
获取指定商户指定日期的日账单
 */
export const fetchDailyBill = async (shopId, accDate) => {
  info(`fetch shopbill(id: ${shopId}, accDate: ${accDate}) from remote`);
  const shopBillUrl = `${ecardApiHost}/shop/${shopId}/daily-bill/${accDate}?token=${auth.ecardApiToken}`;
  try {
    const shopBillResult = await (await fetch(shopBillUrl)).json();
    // 远处获取数据成功
    if (shopBillResult.ret === 0) {
      info('fetchDailyBill is successed');
      return shopBillResult.data;
    }
    error('远程ecard-api调用失败:', shopBillResult);
    throw new Error('fetchDailyBill failed');
  } catch (e) {
    error('fetchDailyBill failed, shopId:', shopId, 'accDate:', accDate);
    throw e;
  }
};

// /*
// 获取指定日期所有商户的日账单
//  */
// export const fetchShopDailyBills = async accDate => {
//   info('fetch daliyBills for all shops.');
//   const url = `${ecardApiHost}/shop/all/daily-bill/${accDate}?token=${auth.ecardApiToken}`;
//   try {
//     const shopBillsResult = await (await fetch(url)).json();
//     // 远处获取数据成功
//     if (shopBillsResult.ret === 0) {
//       info('fetchShopDailyBills is successed');
//       return shopBillsResult.data;
//     }
//     error('远程ecard-api调用失败:', shopBillsResult);
//     throw new Error('fetchShopDailyBills failed');
//   } catch (e) {
//     error('fetchShopDailyBills failed,', 'accDate:', accDate);
//     throw e;
//   }
// };

/*
获取指定商户节点的所有祖先节点
 */
export const fetchAncestorShops = async shopId => {
  info('fetch ancestorShops from remote');
  const url = `${ecardApiHost}/shop/${shopId}/ancestors?token=${auth.ecardApiToken}`;
  try {
    const ancestorShopsResult = await (await fetch(url)).json();
    if (ancestorShopsResult.ret === 0) {
      info('fetch ancestorShops is successed.');
      return ancestorShopsResult.data;
    }
    error('远程ecard-api调用失败:', ancestorShopsResult);
    throw new Error('fetchAncestorShops failed');
  } catch (e) {
    error('fetch ancestorShops failed');
    error(e.message);
    error(e.stack);
    throw e;
  }
};

/*
指定父商户Id和日期，获取子商户日账单列表
 */
export const fetchSubShopDailyBills = async (fShopId, accDate) => {
  try {
    let url = `${ecardApiHost}/shop/${fShopId}/sub-shop-daily-bills/${accDate}?token=${auth.ecardApiToken}`;
    if (fShopId === 0) {
      url = `${ecardApiHost}/shop/all/daily-bill/${accDate}?token=${auth.ecardApiToken}`;
    }
    const subShopBillsResult = await (await fetch(url)).json();
    // 远处获取数据成功
    if (subShopBillsResult.ret === 0) {
      info('fetchSubShopDailyBills is successed');
      return subShopBillsResult.data;
    }
    error('Error Result:', subShopBillsResult);
    throw new Error('fetchSubShopDailyBills failed');
  } catch (msg) {
    error(msg.message);
    error(msg.stack);
    throw msg;
  }
};

export const fetchDeviceDailyBills = async (shopId, accDate) => {
  try {
    const deviceBillsUrl = `${ecardApiHost}/shop/${shopId}/device-daily-bills/${accDate}?token=${auth.ecardApiToken}`;
    const deviceBillsResult = await (await fetch(deviceBillsUrl)).json();
    // 远处获取数据成功
    if (deviceBillsResult.ret === 0) {
      info('fetchDeviceDailyBills is successed');
      return deviceBillsResult.data;
    }
    error('Error Result:', deviceBillsResult);
    throw new Error('fetchDeviceDailyBills failed');
  } catch (msg) {
    error(msg.message);
    error(msg.stack);
    throw msg;
  }
};

/*
获取指定商户指定日期的月账单
 */
export const fetchMonthlyBill = async (shopId, accDate) => {
  info(`fetch shopMonthlybill(id: ${shopId}, accDate: ${accDate}) from remote`);
  const url = `${ecardApiHost}/shop/${shopId}/monthly-bill/${accDate}?token=${auth.ecardApiToken}`;
  try {
    const shopBillResult = await (await fetch(url)).json();
    // 远处获取数据成功
    if (shopBillResult.ret === 0) {
      return shopBillResult.data;
    }
    error('远程ecard-api调用失败:', shopBillResult);
    throw new Error('fetchMonthlyBill failed');
  } catch (e) {
    error('fetchMonthlyBill failed, shopId:', shopId, 'accDate:', accDate);
    throw e;
  }
};

/*
指定父商户Id和账单日期，获取所有子商户的月账单列表
 */
export const fetchSubShopMonthlyBills = async (fShopId, accDate) => {
  let url;
  try {
    url = `${ecardApiHost}/shop/${fShopId}/sub-shop-monthly-bills/${accDate}?token=${auth.ecardApiToken}`;
    if (fShopId === rootShopId) {
      url = `${ecardApiHost}/shop/all/monthly-bill/${accDate}?token=${auth.ecardApiToken}`;
    }
    const subShopBillsResult = await (await fetch(url)).json();
    // 远处获取数据成功
    if (subShopBillsResult.ret === 0) {
      return subShopBillsResult.data;
    }
    throw new Error('fetchSubShopMonthlyBills failed');
  } catch (msg) {
    error('获取子商户月账单失败:', url);
    error(msg.message);
    throw msg;
  }
};
