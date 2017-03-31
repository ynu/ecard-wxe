import React from 'react';
import Bills from './Bills';

export default {

  path: '/operator-bills/:accDate',

  async action({ params }) {
    return {
      title: '云南大学一卡通操作员账单',
      component: <Bills {...params} />,
    };
  },

};
