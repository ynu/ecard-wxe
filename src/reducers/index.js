import { combineReducers } from 'redux';
import user from './user';
import runtime from './runtime';
import wechat from './wechat';
import shop from './shop';

export default combineReducers({
  wechat,
  shop,
  user,
  runtime,
});
