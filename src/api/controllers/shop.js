import { Router } from 'express';
import expressJwt from 'express-jwt';
import { YktManager } from 'ecard-api';
import { SUCCESS, SERVER_FAILED, OBJECT_IS_NOT_FOUND, UNAUTHORIZED } from 'nagu-validates';
import { auth, wxeapi, getShopTag, error, info, mysqlUrl } from '../../config';
import * as wxeAuth from '../controllers/wxe-auth-middlewares';

const router = new Router();

const canUserReadShopBill = async (userId, shop, shops) => {
  // 1. 获取商户的所有祖先节点；
  const getAncestors = shop2 => {
    if (shop2.shopId === '1') return [];
    // 当前节点的父节点
    const father = shops.find(s => s.shopId === shop2.fShopId);
    return [
      ...getAncestors(father),
      father,
    ];
  };
  const ancestors = [
    ...getAncestors(shop),
    shop,
  ];
  info('ancestors of the shop:', ancestors.map(s => s.shopId));
  // 2. 根据所有祖先节点获取tags；
  const tagnames = ancestors.map(s => s.shopName);
  info('tag names of ancestors:', tagnames);

  // 3. 获取所有tags对应的用户列表；

  // 4. 判断用户是否在用户列表中。
};
router.get('/:shopId/daily-bill/:accDate',
  // 确保用户已登录
  expressJwt({
    secret: auth.jwt.secret,
    credentialsRequired: true,
    getToken: wxeAuth.getToken,
  }),
  // async (req, res, next) => {
  //   const { shopId, accDate } = req.params;
  //   const shopBill = await yktManager.getShopBill(shopId, accDate);
  //   const shopBills = await yktManager.getShopBills(null, accDate);
  //   canUserReadShopBill(req.user.UserId, shopBill, shopBills);
  //   next();
  // },
  // 确保当前用户对当前的shop有权限
  async (req, res, next) => {
    const { shopId, accDate } = req.params;
    // 0. 取出当前账单
    try {
      const yktManager = new YktManager({ url: mysqlUrl });
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


      info('current user:', req.user);
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
      const yktManager = new YktManager({ url: mysqlUrl });
      const subShopBills = await yktManager.getShopBills(shopId, accDate);
      const deviceBills = await yktManager.getDeviceBills(shopId, accDate);
      res.send({ ret: SUCCESS,
        data: {
          shopBill: res.shopBill,
          subShopBills,
          deviceBills,
        } });
    } catch (msg) {
      res.send({ ret: SERVER_FAILED, msg });
    }
  }
);

export default router;
