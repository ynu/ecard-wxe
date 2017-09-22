/* eslint-disable no-console */

import { scheduleJob } from 'node-schedule';
import moment from 'moment';
import cache from 'memory-cache';
import { roles, wxeapi, dailyReportCron, monthlyReportCron,
  auth, getTag, dailyReportPicUrl, monthlyReportPicUrl, host,
  error, info, TAG_LIST, rootShopId,
  getShopBillCacheKey, getDeviceBillsCacheKey,
  getSubShopBillsCacheKey, operatorManagerTagId } from '../../config';
import * as shopModel from './cachedShop';
import * as wxeapiModel from './cachedWxeapi';

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
    let title = `${bill.shopName}日账单(${bill.accDate})`;
    let picurl = dailyReportPicUrl;
    if (bill.accDate.length === 6) {
      title = `${bill.shopName}月账单(${bill.accDate})`;
      picurl = monthlyReportPicUrl;
    }
    // 生成消息文本
    const article = {
      title,
      description: `消费金额：${bill.crAmt}元，共${bill.transCnt}笔。`,
      url: `https://${host}/shop/${bill.shopId}/report/${bill.accDate}`,
      picurl,
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
  info('开始:缓存单日数据:', day);
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
  info('结束:缓存单日数据数据');
};

const cacheMonthlyData = async month => {
  // 1. 缓存指定日期的所有月账单
  const shopBills = await shopModel.fetchSubShopMonthlyBills(rootShopId, month, {
    key: getSubShopBillsCacheKey(rootShopId, month),
    expire: TEN_DAYS,
  });

  // 2. 缓存每个商户的所有数据
  const billPromises = shopBills.map(bill => {
    // 2.1. 缓存每一个商户的月账单
    const pBill = shopModel.fetchShopMonthlyBill(bill.shopId, month, {
      key: getShopBillCacheKey(bill.shopId, month),
      expire: TEN_DAYS,
    });

    // 2.2. 缓存每个商户的子商户月账单列表
    const pSubShopBills = shopModel.fetchSubShopMonthlyBills(bill.shopId, month, {
      key: getSubShopBillsCacheKey(bill.shopId, month),
      expire: TEN_DAYS,
    });

    return Promise.all([pBill, pSubShopBills]);
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

    if (!shopBills) {
      error('未能获取商户日账单数据，无法推送');
      return;
    }

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

const getRecentMonth = () => {
  const day = moment().date();
  if (day > 25) return moment().format('YYYYMM');
  return moment().subtract(1, 'months').format('YYYYMM');
};

const reportMonthlyShopBill = async () => {
  info('开始：每日商户账单推送');
  try {
    // 0. 获取tag列表
    const tags = await wxeapiModel.getTagList({ expire: TEN_DAYS });
    info('tags count: ', tags.length);

    const recentMonth = getRecentMonth();
    // 1. 获取商户月账单列表
    const shopBills = await shopModel.fetchSubShopMonthlyBills(rootShopId, recentMonth, {
      key: getSubShopBillsCacheKey(rootShopId, recentMonth),
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
    info('结束：每日商户账单推送');
    return Promise.all(result);
  } catch (e) {
    error('exception occured when reportMonthlyShopBill()');
    error(e.message);
    throw e;
  }
};

const reportDailyOperatorBills = async () => {
  info('开始：每日操作员账单推送');
  try {
    const yestoday = moment().subtract(1, 'days').format('YYYYMMDD');
    // 1. 获取操作员账单列表
    const operatorBills = await shopModel.fetchOperatorBills(yestoday);

    if (!operatorBills) {
      error('未能获取操作员日账单数据，无法推送');
      return;
    }

    // 2. 计算充值金额总数
    const bill = operatorBills.reduce((acc, cur) => ({
      inAmt: acc.inAmt + parseInt(cur.inAmt, 10),
      outAmt: acc.outAmt + parseInt(cur.outAmt, 10),
      transCnt: acc.transCnt + parseInt(cur.transCnt, 10),
    }), { inAmt: 0, outAmt: 0, transCnt: 0 });

    // 生成消息文本
    const article = {
      title: `操作员账单(${yestoday})`,
      description: `收入金额：${bill.inAmt}元，支出金额：${bill.outAmt}，共${bill.transCnt}笔。`,
      url: `https://${host}/operator-bills/${yestoday}`,
    };
    // 2.3. 推送微信通知
    const result = wxeapi.sendNews({ totag: `${operatorManagerTagId}` }, auth.wxent.agentId, [article]);
    info('结束：每日操作员账单推送');
    return result;
  } catch (e) {
    error('每日操作员账单推送异常：', e.message);
  }
};

scheduleJob(dailyReportCron, async () => {
  info('start to daily report. date:', Date.now());
  const result = await reportDailyShopBill();
  console.log('daily report is done.', {
    发送成功: result.filter(r => r.errcode === 0).length,
    发送失败: result.filter(r => r.errcode !== 0).length,
    未发送: result.filter(r => r === {}).length,
  });
});

info('start the report jobs.');

scheduleJob(monthlyReportCron, async () => {
  info('开始：每月推送');
  const result = await reportMonthlyShopBill();
  console.log('monthly report is done.', {
    发送成功: result.filter(r => r.errcode === 0).length,
    发送失败: result.filter(r => r.errcode !== 0).length,
    未发送: result.filter(r => r === {}).length,
  });
  info('结束：每月推送');
});

scheduleJob(dailyReportCron, async () => {
  await reportDailyOperatorBills();
});

scheduleJob('0 0 6 * * *', async () => {
  console.time('缓存数据');
  info('定时缓存开始');
  try {
    const yestoday = moment().subtract(1, 'days').format('YYYYMMDD');
    await cacheDailyData(yestoday);

    info('开始:缓存最近月度数据');
    const recentMonth = getRecentMonth();
    info('最近月份：', recentMonth);

    await cacheMonthlyData(recentMonth);
    info('结束:缓存最近月度数据');
  } catch (e) {
    error('缓存数据出错', e.message);
    error(e.stack);
  } finally {
    console.timeEnd('缓存数据');
  }
  info('完成上一日所有数据缓存');
});
