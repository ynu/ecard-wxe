import jwt from 'jsonwebtoken';
import WxeApi from 'wxe-api';
import { auth } from '../../config';

export const signin = ({
  wxeApiOpitons,
  getRedirectUrl = (req) => req.query.redirect_uri,
  getCallBackUrl = (req) => (`${req.protocol}://${req.get('Host')}${req.originalUrl}}`),
  success = (result, req, res) => {
    res.clearCookie('redirect_uri');

    // 用户验证正确，设置用户jwt，
    const expiresIn = 60 * 60 * 24 * 365; // 365 days
    const token = jwt.sign(result, auth.jwt.secret, { expiresIn });
    res.cookie('token', token, { maxAge: 1000 * expiresIn, httpOnly: true });

    // 返回原URL。当redirect_uri中包含中文时，可能会出错，应该进行encode操作。
    res.redirect(encodeURI(req.signedCookies.redirect_uri));
  },
  fail = (err, req, res) => res.send(fail),
}) => async (req, res, next) => {
  try {
    const wxapi = new WxeApi(wxeApiOpitons);
    const callbackUrl = getCallBackUrl(req, res);
    // 1. 判断是否带有code参数，如果是的话，则说明已经从认证服务器返回
    if ('code' in req.query) {
      // 使用state验证请求是否合法
      if (!req.query.state === req.signedCookies.state) throw new Error({ ret: -1, msg: 'bad state value and illegel request.' });
      // 使用code获取userId
      const userId = await wxapi.getUserIdByCode(req.query.code);

      success(userId, req, res, next);
    } else { // 2. 无'code'参数，转向认证服务器进行认证
      // 2.1 缓存 state 和redirect_uri
      const redirectUri = getRedirectUrl(req, res);
      if (!redirectUri) throw new Error({ ret: -1, msg: 'redirect_uri must be provided.' });

      const state = Math.random().toString();

      // 将state 和 redirect_uri 存入cookie中
      res.cookie('state', state, { maxAge: 30000, signed: true });
      res.cookie('redirect_uri', redirectUri, { maxAge: 30000, signed: true });

      // 2.2 获取认证url
      const url = wxapi.getAuthorizeURL(callbackUrl, state);

      // 2.3 返回客户端，并在转到认证服务器。
      // 此处不能直接跳转到认证url，因为这样cookie就无法在客户端生效。
      res.send(`
        <html>
          <head>
            <meta http-equiv="refresh" content="0; url=${url}" />
          </head>
        </html>
      `);
    }
  } catch (msg) {
    fail({ ret: -1, msg }, req, res, next);
  }
};

/*
获取当前登录用户的userId
 */
export const getme = (
  cookieNameForUserId = 'userId',
  success = (data, req, res) => res.send({ ret: 0, data }),
  fail = (err, req, res) => res.send(err),
) =>
  (req, res, next) => {
    const userId = req.signedCookies[cookieNameForUserId];
    if (userId) success({ userId }, req, res, next);
    else fail({ ret: -1, msg: 'You haven\'t sign in.' }, req, res, next);
  };

export default {
  signin,
  getme,
};

/*
获取当前登录用户的id
 */
export const getUserId = (
  cookieNameForUserId = 'userId',
  success = (userid, req, res, next) => next(),
  fail = (err, req, res) => res.send(err),
) => (req, res, next) => {
  const userid = req.signedCookies[cookieNameForUserId];
  if (userid) success(userid, req, res, next);
  else fail({ ret: -1, msg: 'not logged' }, req, res, next);
};

export const getToken = req => req.cookies.token;
