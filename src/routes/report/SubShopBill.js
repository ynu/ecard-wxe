import React, { PropTypes } from 'react';
import { Cell, CellBody, CellFooter, Badge } from 'react-weui';
import { formatMoney, formatNumber } from 'accounting';

const SubShopBill = ({ bill: { shopId, transCnt, crAmt, drAmt, shopName, accDate } }) => {
  const amount = parseFloat(crAmt, 10) - parseFloat(drAmt, 10);
  return (
    <Cell href={`/shop/${shopId}/report/${accDate}`} access>
      <CellBody>
        {shopName}
        <Badge preset="body">{formatNumber(transCnt)}笔</Badge>
      </CellBody>
      <CellFooter>
        {formatMoney(amount, '￥')}
      </CellFooter>
    </Cell>
  );
};

SubShopBill.propTypes = {
  bill: PropTypes.shape({
    shopId: PropTypes.string.isRequired,
    transCnt: PropTypes.number.isRequired,
    crAmt: PropTypes.number.isRequired,
    shopName: PropTypes.string.isRequired,
    accDate: PropTypes.string.isRequired,
  }).isRequired,
};

export default SubShopBill;
