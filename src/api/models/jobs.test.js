/* eslint-env mocha */

import { reportDailyShopBill } from './jobs';
import WxeApi from 'wxe-api';

describe('Jobs', () => {
  it('reportDailyShopBill', async () => {
    await reportDailyShopBill();
  });
});
