/* eslint-disable no-console */

import { scheduleJob } from 'node-schedule';
import moment from 'moment';
import { roles, tagPrefix, yktManager, wxeapi, dailyReportCron, auth, monitors } from '../../config';

const getTag = (role, id) => `${tagPrefix}_${role}_${id}`;
// const reportDailyDeviceBill = () => {
//   // 1. 获取设备列表
//   // 循环每个设备
//   // 1. 取到当日数据
//   // 2. 推送微信通知
// };

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
    console.log(e);
    return Promise.reject(e);
  }
};

export const reportDailyShopBill = async () => {
  try {
    // 0. 获取tag列表
    const tags = (await wxeapi.getTagList()).taglist;

    const yestoday = moment().subtract(1, 'days').format('YYYYMMDD');
    // 1. 获取商户账单列表
    const shopBills = await yktManager.getShopBills(null, yestoday);
    console.log('shop bills: ', shopBills.length);
    // 2. 循环每个商户账单
    const result = shopBills.map(bill => {
      try {
        // 2.2. 找出tagId
        const tagname = getTag(roles.shopManager, bill.shopName);
        const tag = tags.find(t => t.tagname === tagname);
        if (!tag) return Promise.resolve(null);

        // 2.3. 推送微信通知
        return sendBill(bill, { totag: `${tag.tagid}` }, auth.wxent.agentId);
      } catch (e) {
        console.log('@@@@@@@@', e);
        return null;
      }
    });
    return Promise.all(result);
  } catch (e) {
    console.log(JSON.stringify(e));
    throw e;
  }
};

// const reportDailyTotalBill = () => {
//
// };

// const reportMonthlyDeviceBill = () => {
//
// };
//
// const reportMonthlyShopBill = () => {
//
// };
//
// const reportMonthlyTotalBill = () => {
//
// };

const reportDaily = scheduleJob(dailyReportCron, () => {
  // reportDailyDeviceBill();
  reportDailyShopBill();
  // reportDailyTotalBill();
});
console.log('start the reportDaliy job.');

// const reportMonthly = scheduleJob('0 0 8 0 1 *', () => {
//   reportMonthlyDeviceBill();
//   reportMonthlyShopBill();
//   reportMonthlyTotalBill();
// });
