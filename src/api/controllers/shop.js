import { Router } from 'express';
import expressJwt from 'express-jwt';
import { SUCCESS, SERVER_FAILED } from 'nagu-validates';
import { yktManager } from '../../config';

const router = new Router();

router.get('/:shopId/daily-bill/:accDate',
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
