/*
由远程服务器读取Shop相关数据
 */

import fetch from 'node-fetch';
import { auth, error, info, ecardApiHost } from '../../config';

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

/*
获取指定日期所有商户的日账单
 */
export const fetchShopDailyBills = async accDate => {
  info('fetch daliyBills for all shops.');
  const url = `${ecardApiHost}/shop/all/daily-bill/${accDate}?token=${auth.ecardApiToken}`;
  try {
    const shopBillsResult = await (await fetch(url)).json();
    // 远处获取数据成功
    if (shopBillsResult.ret === 0) {
      info('fetchShopDailyBills is successed');
      return shopBillsResult.data;
    }
    error('远程ecard-api调用失败:', shopBillsResult);
    throw new Error('fetchShopDailyBills failed');
  } catch (e) {
    error('fetchShopDailyBills failed,', 'accDate:', accDate);
    throw e;
  }
};

/*
获取指定商户节点的所有祖先节点
 */
export const fetchAncestorShops = async shopId => {
  info('fetch ancestorShops from remote');

  const url = `${ecardApiHost}/shop/${shopId}/ancestors?token=${ecardApiToken}`;
  try {
    const ancestorShopsResult = await (await fetch(url)).josn();
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

export const fetchSubShopDailyBills = async (fShopId, accDate) => {
  try {
    const subShopBillsUrl = `${ecardApiHost}/shop/${fShopId}/sub-shop-daily-bills/${accDate}?token=${auth.ecardApiToken}`;
    const subShopBillsResult = await (await fetch(subShopBillsUrl)).json();
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

export const fetchShops = async () => {

};
