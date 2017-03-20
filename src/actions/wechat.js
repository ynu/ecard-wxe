export const SELECT_ENTERPRISE_CONTACT = 'wechat/jssdk/SELECT_ENTERPRISE_CONTACT';

export const selectEnterpriseContact = result => ({
  type: SELECT_ENTERPRISE_CONTACT,
  result,
});

export const JSSDK_CONFIG = 'wechat/jssdk/JSSDK_CONFIG';
export const JSSDK_READY = 'wechat/jssdk/JSSDK_READY';

export const jssdkConfig = config => ({
  type: JSSDK_CONFIG,
  config,
});

export const jssdkReady = () => ({
  type: JSSDK_READY,
});

export const SHOW_CONFIRM = 'wechat/weui/SHOW_CONFIRM';
export const HIDE_CONFIRM = 'wechat/weui/HIDE_CONFIRM';

export const showConfirm = data => ({
  type: SHOW_CONFIRM,
  data,
});
export const hideConfirm = () => ({
  type: HIDE_CONFIRM,
});

export const SHOW_GALLERY = 'wechat/weui/SHOW_GALLERY';
export const showGallery = file => ({
  type: SHOW_GALLERY,
  file,
});
