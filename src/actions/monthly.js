import { OTHER_ERROR, SUCCESS } from 'nagu-validates';
import fetch from '../core/fetch';
import { fetching, fetchFailed, fetchDone } from './common';


/*
获取指定商户指定日期的月账单
 */
export const getShopBill = (shopId, accDate) => async dispatch => {
  dispatch(fetching());
  try {
    const res = await fetch(`/api/shop/${shopId}/monthly-bill/${accDate}`, {
      credentials: 'same-origin',
    });
    const result = await res.json();
    if (result.ret === SUCCESS) {
      const data = {
        shopBill: result.data.shopBill || {},
        subShopBills: result.data.subShopBills || [],
      };
      dispatch(fetchDone(data));
      return Promise.resolve(data);
    }
    dispatch(fetchFailed(result));
    return Promise.reject(result);
  } catch (msg) {
    const result = {
      ret: OTHER_ERROR,
      msg,
    };
    dispatch(fetchFailed(result));
    return Promise.reject(result);
  }
};

export default {
  getShopBill,
};
