import React from 'react';
import Report from './Report';

export default {

  path: '/shop/:shopId/daily-bill/:accDate',

  async action({ params }) {
    return {
      title: '云南大学一卡通日结账单',
      component: <Report {...params} />,
    };
  },

};
