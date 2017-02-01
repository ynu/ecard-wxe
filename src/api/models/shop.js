import fetch from 'node-fetch';
import { YktManager } from 'ecard-api';
import { auth, mysqlUrl,
  error, info, ecardApiHost } from '../../config';


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

export const fetchAncestorShops = async shopId => {
  info('fetch ancestorShops from remote');
  try {
    const yktManager = new YktManager({ url: mysqlUrl });
    const ancestors = await yktManager.getAncestorShops(shopId);
    return ancestors;
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

/*
获取指定日期的所有日账单
 */
export const fetchShopDailyBills = async accDate => {
  try {
    const yktManager = new YktManager({ url: mysqlUrl });
    const shopBills = await yktManager.getShopBills(null, accDate);
    return shopBills;
  } catch (e) {
    error('fetchShopDailyBills failed');
    error(e.message);
    error(e.stack);
    return [];
  }
};

export const fetchShops = async () => {

};
