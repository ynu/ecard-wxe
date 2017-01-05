import { OTHER_ERROR, SUCCESS } from 'nagu-validates';
import fetch from '../core/fetch';
import { fetching, fetchFailed, fetchDone } from './common';

export const getShopBill = (shopId, accDate) => async dispatch => {
  dispatch(fetching());
  try {
    const res = await fetch(`/api/shop/${shopId}/daily-bill/${accDate}`, {
      credentials: 'same-origin',
    });
    const result = await res.json();
    if (result.ret === SUCCESS) {
      dispatch(fetchDone(result.data));
      return Promise.resolve(result.data);
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
