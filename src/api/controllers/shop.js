import { Router } from 'express';
import expressJwt from 'express-jwt';
import { SUCCESS, SERVER_FAILED } from 'nagu-validates';
import { host, auth } from '../../config';

const router = new Router();

router.get('/:shopId/daily-bill/:accDate',
  async (req, res) => {
    const { shopId, accDate } = req.params;
    return res.send({
      ret: SUCCESS,
      data: {
        shopId: 9999,
        shopName: 'Test',
        accDate: '20220202',
        transCnt: 93,
        crAmt: 3458,
        drAmt: 0,
      },
    });
  }
);

export default router;
