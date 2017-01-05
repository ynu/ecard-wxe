/* eslint-env mocha */
import { reportDailyShopBill } from './jobs';
import WxeApi from 'wxe-api';
import { yktManager } from '../../config';

describe('Jobs', function () {
  this.timeout(600000);
  it('reportDailyShopBill', async () => {
    await reportDailyShopBill();
  });
});
