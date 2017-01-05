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

export const reportDailyShopBill = async () => {
  try {
    // 0. 获取tag列表
    const tags = (await wxeapi.getTagList()).taglist;
    console.log(tags);
    // 1. 获取商户列表
    const shops = await yktManager.getShops();

    // 2. 循环每个商户
    const yestoday = moment().subtract(1, 'days').format('YYYYMMDD');
    shops.forEach(async shop => {
      try {
        // 2.1. 取到昨日数据
        const bill = await yktManager.getShopBill(shop.shopId, yestoday);

        // 生成消息文本
        let content = '一卡通日结单\n---\n';
        content += `商户: ${bill.shopName}\n`;
        content += `日期: ${bill.accDate}\n`;
        content += `消费笔数: ${bill.transCnt}\n`;
        content += `消费金额: ${bill.crAmt}\n`;
        content += `充值金额: ${bill.drAmt}\n`;

        // 2.2. 找出tagId
        const tagname = getTag(roles.posManager, bill.shopName);
        const tag = tags.find(t => t.tagname === tagname);
        if (!tag) return;

        // 2.3. 推送微信通知
        const result = await wxeapi.sendText({ totag: `${tag.tagid}` }, auth.wxent.agentId, content);
        console.log(JSON.stringify(result));
      } catch (e) {
        throw e;
      }
    });
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

// const reportMonthly = scheduleJob('0 0 8 0 1 *', () => {
//   reportMonthlyDeviceBill();
//   reportMonthlyShopBill();
//   reportMonthlyTotalBill();
// });
