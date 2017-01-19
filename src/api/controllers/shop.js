import { Router } from 'express';
import expressJwt from 'express-jwt';
import { YktManager } from 'ecard-api';
import { SUCCESS, SERVER_FAILED, OBJECT_IS_NOT_FOUND, UNAUTHORIZED } from 'nagu-validates';
import { auth, wxeapi, getShopTag, error, info, mysqlUrl } from '../../config';
import * as wxeAuth from '../controllers/wxe-auth-middlewares';

const getTagList = () => wxeapi.getTagList();
const router = new Router();

router.get('/:shopId/daily-bill/:accDate',
  // 确保用户已登录
  expressJwt({
    secret: auth.jwt.secret,
    credentialsRequired: true,
    getToken: wxeAuth.getToken,
  }),
  // 检查当前用户是否有权限
  async (req, res, next) => {
    try {
      const { shopId, accDate } = req.params;
      const userid = req.user.UserId;
      const yktManager = new YktManager({ url: mysqlUrl });

      // 0. 取当前商户账单
      res.shopBill = await yktManager.getShopBill(shopId, accDate);
      if (!res.shopBill) {
        error('读取当前商户账单失败, shopId:', shopId, 'accDate:', accDate);
        res.send({ ret: OBJECT_IS_NOT_FOUND });
        return;
      }
      // 1. 获取商户的所有祖先节点；
      const ancestors = await yktManager.getAncestorShops(shopId);
      info('ancestors of the shop:', ancestors.map(s => s.shopId));

      // 2. 根据当前商户及所有祖先节点获取tags；
      const tagnames = [
        ...ancestors.map(s => s.shopName),
        res.shopBill.shopName,
      ].map(sname => getShopTag(sname));
      info('tag names of ancestors:', tagnames);

      // 3. 获取所有tags对应的用户列表；
      // 3.1 获取所有tag列表
      const taglist = await getTagList();
      // 3.2 获取所有tag的详细信息
      const tagPromises = tagnames.map(tagname => {
        const tag = taglist.find(t => t.tagname === tagname);
        if (tag) return wxeapi.getTag(tag.tagid);
        return null;
      }).filter(p => p !== null);
      info('tagPromises count:', tagPromises.length);

      const tagDetails = await Promise.all(tagPromises);
      // 3.3 获取所有tag对应的所有用户
      const users = tagDetails.map(td => td.userlist)
        .reduce((userlist, cur) => userlist.concat(cur), []);
      info('users count:', users.length);
      // 4. 判断用户是否在用户列表中。
      if (users.some(u => u.userid === userid)) {
        info('用户权限检查通过');
        next();
      } else {
        info('用户权限检查失败');
        res.send({ ret: UNAUTHORIZED });
      }
    } catch (e) {
      error('检查当前用户是否有权限错误:', e.message);
      error('检查当前用户是否有权限错误:', e.stack);
      res.send({ ret: SERVER_FAILED, msg: e });
    }
  },
  // 发送账单数据
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
