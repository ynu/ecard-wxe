import { Router } from 'express';
import expressJwt from 'express-jwt';
import { SUCCESS, SERVER_FAILED } from 'nagu-validates';
import WxeApi from 'wxe-api';
import { signin, getToken } from '../controllers/wxe-auth-middlewares';
import { host, auth } from '../../config';

const router = new Router();
const wxapi = new WxeApi(auth.wxent);
router.get('/',
  signin({
    wxeApiOpitons: auth.wxent,
    getCallBackUrl: () => `http://${host}/api/wxe-auth/`,
  }),
);

// 获取当前登录用户信息
router.get('/me',
  expressJwt({
    secret: auth.jwt.secret,
    credentialsRequired: true,
    getToken,
  }),
  (req, res) => {
    res.send({ ret: SUCCESS, data: req.user });
  }
);

router.get('/jsconfig', async (req, res) => {
  try {
    const data = await wxapi.getJsConfig({
      ...req.query,
      debug: req.query.debug === 'true',
      jsApiList: JSON.parse(req.query.jsApiList),
    });
    res.send({ ret: SUCCESS, data });
  } catch (msg) {
    console.log(msg);
    res.send({ ret: SERVER_FAILED, msg });
  }
});

router.get('/groupConfig', async (req, res) => {
  try {
    const data = await wxapi.getGroupConfig(req.query.url);
    res.send({ ret: SUCCESS, data });
  } catch (msg) {
    console.log(msg);
    res.send({ ret: SERVER_FAILED, msg });
  }
});

export default router;
