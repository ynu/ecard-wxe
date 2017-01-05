import React from 'react';
import Report from './Report';

export default {

  path: '/',

  async action() {
    return {
      title: '云南大学一卡通日结账单',
      component: <Report />,
    };
  },

};
