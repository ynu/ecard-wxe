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
    let content = '一卡通日结单\n---\n';
    content += `商户: ${bill.shopName}\n`;
    content += `日期: ${bill.accDate}\n`;
    content += `消费笔数: ${bill.transCnt}\n`;
    content += `消费金额: ${bill.crAmt}\n`;
    content += `充值金额: ${bill.drAmt}\n`;

    // 2.3. 推送微信通知
    return wxeapi.sendText(to, agentId, content);
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

const reportDaily = scheduleJob('0 * * * * *', () => {
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
