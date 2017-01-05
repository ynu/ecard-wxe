import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import * as wechatActions from '../../actions/wechat';

class WxConfig extends React.Component {
  static async getJsConfig(jsApiList, debug = false) {
    const url = encodeURIComponent(window.location.href.split('#')[0]);
    const res = await fetch(`/api/wxe-auth/jsconfig?jsApiList=${JSON.stringify(jsApiList)}&url=${url}&debug=${debug}`);
    const result = await res.json();
    return result.data;
  }

  async componentDidMount() {
    const { debug, jsApiList, jssdkConfig } = this.props;
    const jsConfig = await WxConfig.getJsConfig(jsApiList, debug);
    wx.config(jsConfig);
    jssdkConfig(jsConfig);
  }
  render() {
    return null;
  }
}

export default connect(null, {
  ...wechatActions,
})(WxConfig);
