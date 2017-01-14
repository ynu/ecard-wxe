/* eslint-disable no-console */

import { scheduleJob } from 'node-schedule';
import moment from 'moment';
import { roles, yktManager, wxeapi, dailyReportCron,
  auth, getTag,
  error } from '../../config';

const info = require('debug')('ecard-wxe:report:info');

const sendBill = async (bill, to, agentId) => {
  try {
    // 生成消息文本
    const article = {
      title: `${bill.shopName}日结单(${bill.accDate})`,
      description: `消费金额：${bill.crAmt}元，共${bill.transCnt}笔。`,
      url: `http://ecard-wxe.ynu.edu.cn/shop/${bill.shopId}/daily-bill/${bill.accDate}`,
      picurl: 'http://www.ynu.edu.cn/images/content/2013-12/20131022162236810671.jpg',
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
    // 0. 获取tag列表
    const tags = await wxeapi.getTagList();
    info('tags count: ', tags.length);

    const yestoday = moment().subtract(1, 'days').format('YYYYMMDD');
    // 1. 获取商户账单列表
    const shopBills = await yktManager.getShopBills(null, yestoday);
    info('shop bills count: ', shopBills.length);

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
  info('daily report is done.', result);
});
info('start the reportDaliy job.');
