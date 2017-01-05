import { combineReducers } from 'redux';
import user from './user';
import runtime from './runtime';
import wechat from './wechat';

export default combineReducers({
  wechat,
  user,
  runtime,
});
