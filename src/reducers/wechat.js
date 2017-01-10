import { combineReducers } from 'redux';
import { SELECT_ENTERPRISE_CONTACT, JSSDK_READY, JSSDK_CONFIG } from '../actions/wechat';
import { FETCHING, FETCH_DONE, FETCH_FAILED } from '../actions/common';

const selectedEnterpriseContact = (state = {
  departmentList: [],
  tagList: [],
  userList: [],
}, action) => {
  switch (action.type) {
    case SELECT_ENTERPRISE_CONTACT:
      return action.result;
    default:
      return state;
  }
};

const jssdk = (state = {
  isReady: false,
  config: null,
}, action) => {
  switch (action.type) {
    case JSSDK_READY:
      return {
        ...state,
        isReady: true,
      };
    case JSSDK_CONFIG:
      return {
        isReady: false,
        config: action.config,
      };
    default:
      return state;
  }
};

const toast = (state = {
  loading: false,
}, action) => {
  switch (action.type) {
    case FETCHING:
      return {
        loading: true,
        icon: 'loading',
      };
    case FETCH_DONE:
    case FETCH_FAILED:
      return { loading: false };
    default:
      return state;
  }
};

export default combineReducers({
  selectedEnterpriseContact,
  jssdk,
  toast,
});
