/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* eslint-disable max-len */
import path from 'path';
import WxeApi from 'wxe-api';
import debug from 'debug';

export const port = process.env.PORT || 3000;
export const host = process.env.WEBSITE_HOSTNAME || `localhost:${port}`;

export const databaseUrl = process.env.DATABASE_URL || 'sqlite:database.sqlite';

export const mysqlUrl = process.env.MYSQL_URL;

export const analytics = {

  // https://analytics.google.com/
  google: {
    trackingId: process.env.GOOGLE_TRACKING_ID, // UA-XXXXX-X
  },

};

export const auth = {

  jwt: { secret: process.env.JWT_SECRET || 'React Starter Kit' },

  // 微信企业号
  wxent: {
    corpId: process.env.WXE_CORPID,
    secret: process.env.WXE_SECRET,
    agentId: process.env.WXE_AGENTID || 28,
  },

  // ecard-api token
  ecardApiToken: process.env.ECARD_API_TOKEN,
};

export const tagPrefix = process.env.TAG_PREFIX || '一卡通';
export const roles = {
  posManager: process.env.POS_MANAGER || 'POS管理员',
  shopManager: process.env.SHOP_MANAGER || '商户管理员',
  ecManager: process.env.ECARD_CENTER_MANAGER || '中心管理员',
};
export const monitors = process.env.MONITOR_USERID || 'na57';

export const daliyReportPicUrl = process.env.DAILY_REPORT_PICURL || 'http://www.ynu.edu.cn/images/content/2013-12/20131022162236810671.jpg';
export const monthlyReportPicUrl = process.env.MONTHLY_REPORT_PICURL;

export const getTag = (role, id) => `${tagPrefix}_${role}_${id}`;
export const getShopTag = shopName => getTag(roles.shopManager, shopName);

export const dailyReportCron = process.env.DAILY_REPORT_CRON || '0 0 8 * * *';
export const wxeapi = new WxeApi(auth.wxent);

// HTTPS 相关
export const enableHttps = process.env.ENABLE_HTTPS === 'true';
export const httpsPort = process.env.HTTPS_PORT || 3443;
export const privateKeyFilePath = process.env.PRIVETE_KEY_FILE_PATH || path.resolve(__dirname, '../ssl/example.key');
export const certificateFilePath = process.env.CERTIFICATE_FILE_PATH || path.resolve(__dirname, '../ssl/example.crt');

// debug
export const error = debug('ecard-wxe:error');
export const info = debug('ecard-wxe:info');

// ecard-api
export const ecardApiHost = process.env.ECARD_API_HOST || 'http://ecard-api.ynu.edu.cn';
