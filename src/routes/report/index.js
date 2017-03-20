import React from 'react';
import Report from './Report';
import { getShopBill as getDailyBill } from '../../actions/daily';
import { getShopBill as getMonthlyBill } from '../../actions/monthly';

export default {

  path: '/shop/:shopId/report/:accDate',

  async action({ params }) {
    let title = '云南大学一卡通日账单';
    let getReport = getDailyBill;
    if (params.accDate.length === 6) {
      title = '云南大学一卡通月账单';
      getReport = getMonthlyBill;
    }
    return {
      title,
      component: <Report {...params} getReport={getReport} />,
    };
  },

};
