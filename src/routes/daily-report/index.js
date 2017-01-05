import React from 'react';
import Report from './Report';

export default {

  path: '/daily',

  async action() {
    return {
      title: '云南大学一卡通日结账单',
      component: <Report shop={{ shopName: 'shopName' }} />,
    };
  },

};
