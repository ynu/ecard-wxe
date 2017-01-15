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

  // https://developers.facebook.com/
  facebook: {
    id: process.env.FACEBOOK_APP_ID || '186244551745631',
    secret: process.env.FACEBOOK_APP_SECRET || 'a970ae3240ab4b9b8aae0f9f0661c6fc',
  },

  // https://cloud.google.com/console/project
  google: {
    id: process.env.GOOGLE_CLIENT_ID || '251410730550-ahcg0ou5mgfhl8hlui1urru7jn5s12km.apps.googleusercontent.com',
    secret: process.env.GOOGLE_CLIENT_SECRET || 'Y8yR9yZAhm9jQ8FKAL8QIEcd',
  },

  // https://apps.twitter.com/
  twitter: {
    key: process.env.TWITTER_CONSUMER_KEY || 'Ie20AZvLJI2lQD5Dsgxgjauns',
    secret: process.env.TWITTER_CONSUMER_SECRET || 'KTZ6cxoKnEakQCeSpZlaUCJWGAlTEBJj0y2EMkUBujA7zWSvaQ',
  },
  // 微信企业号
  wxent: {
    corpId: process.env.WXE_CORPID,
    secret: process.env.WXE_SECRET,
    agentId: process.env.WXE_AGENTID || 28,
  },
};

export const tagPrefix = process.env.TAG_PREFIX || '一卡通';
export const roles = {
  posManager: process.env.POS_MANAGER || 'POS管理员',
  shopManager: process.env.SHOP_MANAGER || '商户管理员',
  ecManager: process.env.ECARD_CENTER_MANAGER || '中心管理员',
};
export const monitors = process.env.MONITOR_USERID || 'na57';

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
