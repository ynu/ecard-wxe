/* eslint-disable no-console */

import { scheduleJob } from 'node-schedule';
import moment from 'moment';
import { YktManager } from 'ecard-api';
import cache from 'memory-cache';
import { roles, wxeapi, dailyReportCron,
  auth, getTag, mysqlUrl, dailyReportPicUrl, host,
  error, TAG_LIST, CACHE_TIME_10_DAYS,
  getShopBillCacheKey, getShopAncestorsCacheKey } from '../../config';

const info = require('debug')('ecard-wxe:report:info');

const sendBill = async (bill, to, agentId) => {
  try {
    // 生成消息文本
    const article = {
      title: `${bill.shopName}日账单(${bill.accDate})`,
      description: `消费金额：${bill.crAmt}元，共${bill.transCnt}笔。`,
      url: `http://${host}/shop/${bill.shopId}/daily-bill/${bill.accDate}`,
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

export const reportDailyShopBill = async () => {
  try {
    // 0. 从远程获取tag列表，并缓存
    const tags = await wxeapi.getTagList();
    cache.put(TAG_LIST, tags, CACHE_TIME_10_DAYS);
    info('tags count: ', tags.length);

    const yestoday = moment().subtract(1, 'days').format('YYYYMMDD');
    // 1. 获取商户账单列表
    info('connect to:', mysqlUrl);
    const yktManager = new YktManager({ url: mysqlUrl });
    const shopBills = await yktManager.getShopBills(null, yestoday);
    info('shop bills count: ', shopBills.length);

    // 2. 循环每个商户账单
    const result = shopBills.map(bill => {
      try {
        // 2.1 缓存每一个shopBill
        cache.put(getShopBillCacheKey(bill.shopId, yestoday), bill, CACHE_TIME_10_DAYS);

        // 计算每个商户的祖先节点并缓存，以提高用户浏览速度
        yktManager.getAncestorShops(bill).then(ancestors => {
          cache.put(getShopAncestorsCacheKey(bill.shopId), ancestors, CACHE_TIME_10_DAYS);
        });

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

scheduleJob('0 0 6 * * *', () => {
  console.log('cache size:', cache.size());
  console.log('cache hits:', cache.hits());
  info('cache keys:', cache.keys());
});
info('start to cache size report job.');
