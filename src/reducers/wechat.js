import { combineReducers } from 'redux';
import { SELECT_ENTERPRISE_CONTACT, JSSDK_READY, JSSDK_CONFIG } from '../actions/wechat';

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

export default combineReducers({
  selectedEnterpriseContact,
  jssdk,
});
