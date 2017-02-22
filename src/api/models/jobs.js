/* eslint-disable no-console */

import { scheduleJob } from 'node-schedule';
import moment from 'moment';
import cache from 'memory-cache';
import { roles, wxeapi, dailyReportCron,
  auth, getTag, dailyReportPicUrl, host,
  error, info, TAG_LIST, rootShopId,
  getShopBillCacheKey, getDeviceBillsCacheKey,
  getSubShopBillsCacheKey } from '../../config';
import * as shopModel from './cachedShop';

const TEN_DAYS = 10 * 24 * 60 * 60 * 1000;

/*
发送账单给微信用户
参数：
  - bill 账单对象
  - to 接收账单的用户对象，例如: { touser: ['na57'] }
  - agentId 整数，用于发送消息的企业号应用Id
 */
const sendBill = async (bill, to, agentId) => {
  try {
    // 生成消息文本
    const article = {
      title: `${bill.shopName}日账单(${bill.accDate})`,
      description: `消费金额：${bill.crAmt}元，共${bill.transCnt}笔。`,
      url: `https://${host}/shop/${bill.shopId}/report/${bill.accDate}`,
      picurl: dailyReportPicUrl,
    };

    // 2.3. 推送微信通知
    return wxeapi.sendNews(to, agentId, [article]);
  } catch (e) {
    error('sendBill():', e.message);
    error('sendBill():', e.stack);
    return Promise.reject(e);
  }
};

const cacheDailyData = async day => {
  // 1. 缓存指定日期的所有日账单
  const shopBills = await shopModel.fetchSubShopDailyBills(rootShopId, day, {
    key: getSubShopBillsCacheKey(rootShopId, day),
    expire: TEN_DAYS,
  });
  // 2. 缓存每个商户的所有数据
  const billPromises = shopBills.map(bill => {
    // 2.1. 缓存每一个商户的日账单
    const pBill = shopModel.fetchDailyBill(bill.shopId, day, {
      key: getShopBillCacheKey(bill.shopId, day),
      expire: TEN_DAYS,
    });

    // 2.2. 缓存每个商户的子商户日账单列表
    const pSubShopBills = shopModel.fetchSubShopDailyBills(bill.shopId, day, {
      key: getSubShopBillsCacheKey(bill.shopId, day),
      expire: TEN_DAYS,
    });

    // 2.3. 缓存每个商户的设备日账单列表
    const pDeviceBills = shopModel.fetchDeviceDailyBills(bill.shopId, day, {
      key: getDeviceBillsCacheKey(bill.shopId, day),
      expire: TEN_DAYS,
    });
    return Promise.all([pBill, pSubShopBills, pDeviceBills]);
  });
  await Promise.all(billPromises);
};

const reportDailyShopBill = async () => {
  try {
    // 0. 从远程获取tag列表，并缓存
    const tags = await wxeapi.getTagList();
    cache.put(TAG_LIST, tags, TEN_DAYS);
    info('tags count: ', tags.length);

    const yestoday = moment().subtract(1, 'days').format('YYYYMMDD');
    // 1. 获取商户账单列表
    const shopBills = await shopModel.fetchSubShopDailyBills(rootShopId, yestoday, {
      key: getSubShopBillsCacheKey(rootShopId, yestoday),
      expire: TEN_DAYS,
    });

    // 2. 循环每个商户账单
    const result = shopBills.map(bill => {
      try {
        // 2.2. 找出tagId
        const tagname = getTag(roles.shopManager, bill.shopName);
        const tag = tags.find(t => t.tagname === tagname);
        if (!tag) {
          info('tagname is not exists: ', tagname);
          return Promise.resolve({});
        }

        // 2.3. 推送微信通知
        return sendBill(bill, { totag: `${tag.tagid}` }, auth.wxent.agentId);
      } catch (e) {
        error('exception occured when send bill: ', bill);
        error(e.message);
        error(e.stack);
        return null;
      }
    });
    return Promise.all(result);
  } catch (e) {
    error('exception occured when reportDailyShopBill()');
    error(e);
    throw e;
  }
};

scheduleJob(dailyReportCron, async () => {
  info('start to daily report. date:', Date.now());
  const result = await reportDailyShopBill();
  info('daily report is done.', {
    发送成功: result.filter(r => r.errcode === 0).length,
    发送失败: result.filter(r => r.errcode !== 0).length,
    未发送: result.filter(r => r === {}).length,
  });
});
info('start the reportDaliy job.');

scheduleJob('0 30 * * * *', () => {
  console.log('cache size:', cache.size());
});
info('start to cache size report job.');

scheduleJob('0 0 6 * * *', async () => {
  console.time('缓存数据');
  try {
    const yestoday = moment().subtract(1, 'days').format('YYYYMMDD');
    await cacheDailyData(yestoday);
    console.log(cache.size());
  } catch (e) {
    error('缓存数据出错', e.message);
    error(e.stack);
  } finally {
    console.timeEnd('缓存数据');
  }
  info('完成上一日所有数据缓存');
});
