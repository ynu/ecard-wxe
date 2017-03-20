import { combineReducers } from 'redux';
import { FETCH_DONE } from '../actions/common';

const defaultReport = {
  shopBill: {
    crAmt: '0',
    drAmt: '0',
    transCnt: '0',
  },
  subShopBills: [],
  deviceBills: [],
};
const report = (state = defaultReport, action) => {
  switch (action.type) {
    case FETCH_DONE:
      return {
        ...defaultReport,
        ...action.data,
      };
    default:
      return state;
  }
};


export default combineReducers({
  report,
});
