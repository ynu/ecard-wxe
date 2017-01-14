import { Router } from 'express';
import expressJwt from 'express-jwt';
import { SUCCESS, SERVER_FAILED, OBJECT_IS_NOT_FOUND, UNAUTHORIZED } from 'nagu-validates';
import { yktManager, auth, wxeapi, getShopTag, error } from '../../config';
import * as wxeAuth from '../controllers/wxe-auth-middlewares';

const router = new Router();

router.get('/:shopId/daily-bill/:accDate',
  // 确保用户已登录
  expressJwt({
    secret: auth.jwt.secret,
    credentialsRequired: true,
    getToken: wxeAuth.getToken,
  }),
  // 确保当前用户对当前的shop有权限
  async (req, res, next) => {
    const { shopId, accDate } = req.params;
    // 0. 取出当前账单
    try {
      const shopBill = await yktManager.getShopBill(shopId, accDate);
      if (!shopBill) return res.send({ ret: OBJECT_IS_NOT_FOUND });
      res.shopBill = shopBill;
      // 1. 取系统所有tag列表
      const tags = await wxeapi.getTagList();

      // 2. 筛选出当前shop对应的tag
      let tag = tags.find(t => t.tagname === getShopTag(shopBill.shopName));
      if (!tag) return res.send({ ret: OBJECT_IS_NOT_FOUND });
      // 3. 检查此tag中是否包含当前用户
      tag = await wxeapi.getTag(tag.tagid);

      console.log('###', req.user);
      if (tag.userlist.find(user => user.userid === req.user.UserId)) {
        next();
      } else {
        res.send({ ret: UNAUTHORIZED });
      }
    } catch (msg) {
      res.send({ ret: SERVER_FAILED, msg: msg.message });
    }
  },
  async (req, res) => {
    const { shopId, accDate } = req.params;
    try {
      const shopBill = await yktManager.getShopBill(shopId, accDate);
      const subShopBills = await yktManager.getShopBills(shopId, accDate);
      const deviceBills = await yktManager.getDeviceBills(shopId, accDate);
      res.send({ ret: SUCCESS, data: {
        shopBill, subShopBills, deviceBills,
      } });
    } catch (msg) {
      res.send({ ret: SERVER_FAILED, msg });
    }
  }
);

export default router;
