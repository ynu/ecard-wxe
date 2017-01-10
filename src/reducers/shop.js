import { combineReducers } from 'redux';
import { FETCH_DONE, FETCHING } from '../actions/common';

const dailyBill = (state = {
  shopBill: {},
  subShopBills: [],
  deviceBills: [],
}, action) => {
  switch (action.type) {
    case FETCH_DONE:
      return action.data;
    default:
      return state;
  }
};

export default combineReducers({
  dailyBill,
});
