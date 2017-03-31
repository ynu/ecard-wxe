/*
eslint-disable no-param-reassign, no-console
 */

import { Router } from 'express';
import expressJwt from 'express-jwt';
import { SUCCESS, SERVER_FAILED, UNAUTHORIZED } from 'nagu-validates';
import { auth, getShopTag, error, info } from '../../config';
import * as wxeAuth from '../controllers/wxe-auth-middlewares';
import * as shopMiddlewares from './shop-middlewares';
import * as wxeMiddlewares from './wxe-middlewares';
import * as wxeMondel from '../models/cachedWxeapi';

const router = new Router();

router.get('/:shopId/daily-bill/:accDate',
  // 确保用户已登录
  expressJwt({
    secret: auth.jwt.secret,
    credentialsRequired: true,
    getToken: wxeAuth.getToken,
  }),

  // 规整输入参数
  (req, res, next) => {
    let { shopId, accDate } = req.params;
    shopId = `${parseInt(shopId, 10)}`;
    accDate = `${parseInt(accDate, 10)}`;
    req.params = { shopId, accDate };
    next();
  },

  // 获取微信企业号tag列表
  wxeMiddlewares.getTagList(),

  // 获取当前商户账单
  shopMiddlewares.fetchShopBill(),

  // 获取当前商户的祖先节点
  shopMiddlewares.fetchAncestorShops(),

  // 检查当前用户是否有权限
  async (req, res, next) => {
    const userid = req.user.UserId;
    info('Current user is: ', userid);
    try {
      // 1. 获取商户的所有祖先节点；
      const ancestors = res.ancestorShops;
      info('ancestors of the shop:', ancestors.map(s => s.shopId));
      // 2. 根据当前商户及所有祖先节点获取tags；
      console.time('检查权限耗时');
      const tagnames = [
        ...ancestors.map(s => s.shopName),
        res.shopBill.shopName,
      ].map(sname => getShopTag(sname));
      info('tag names of ancestors:', tagnames);

      // 3. 获取所有tags对应的用户列表；
      // 3.1 获取所有tag列表
      const taglist = req.tagList;
      // 3.2 获取所有tag的详细信息
      const tagPromises = tagnames.map(tagname => {
        const tag = taglist.find(t => t.tagname === tagname);
        if (tag) return wxeMondel.getTag(tag.tagid);
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
        console.timeEnd('检查权限耗时');
        next();
      } else {
        info('用户权限检查失败');
        res.send({ ret: UNAUTHORIZED });
      }
    } catch (e) {
      error('检查当前用户是否有权限-错误:', e.message);
      error('检查当前用户是否有权限-错误:', e.stack);
      res.send({ ret: SERVER_FAILED, msg: e });
    }
  },

  // 获取子商户日账单列表
  shopMiddlewares.fetchSubShopDailyBills(),

  // 获取商户设备日账单列表
  shopMiddlewares.fetchDeviceDailyBills(),

  // 返回结果
  async (req, res) => res.json({
    ret: SUCCESS,
    data: {
      shopBill: res.shopBill,
      subShopBills: res.subShopBills,
      deviceBills: res.deviceBills,
    },
  })
);

router.get('/:shopId/monthly-bill/:accDate',
  // 确保用户已登录
  expressJwt({
    secret: auth.jwt.secret,
    credentialsRequired: true,
    getToken: wxeAuth.getToken,
  }),

  // 规整输入参数
  (req, res, next) => {
    let { shopId, accDate } = req.params;
    shopId = `${parseInt(shopId, 10)}`;
    accDate = `${parseInt(accDate, 10)}`;
    req.params = { shopId, accDate };
    next();
  },

  // 获取微信企业号tag列表
  wxeMiddlewares.getTagList(),

  // 获取商户月账单
  shopMiddlewares.fetchShopMonthlyBill(),

  // 获取子商户日账单列表
  shopMiddlewares.fetchSubShopMonthlyBills(),

  // 返回结果
  async (req, res) => res.json({
    ret: SUCCESS,
    data: {
      shopBill: res.shopBill,
      subShopBills: res.subShopBills,
    },
  })
);

router.get('/operator-bills/:accDate',
  // 确保用户已登录
  expressJwt({
    secret: auth.jwt.secret,
    credentialsRequired: true,
    getToken: wxeAuth.getToken,
  }),

  // 规整输入参数
  (req, res, next) => {
    let { accDate } = req.params;
    accDate = `${parseInt(accDate, 10)}`;
    req.params = { accDate };
    next();
  },

  // 获取操作员账单
  shopMiddlewares.fetchOperatorBills(),

  // 返回结果
  async (req, res) => res.json({
    ret: SUCCESS,
    data: res.data,
  })
);
export default router;
