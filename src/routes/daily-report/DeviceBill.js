import React, { PropTypes } from 'react';
import { Cell, CellBody, CellFooter, Badge } from 'react-weui';
import { formatMoney, formatNumber } from 'accounting';

const DeviceBill = ({ bill: { shopId, transCnt, crAmt, shopName, accDate } }) => (
  <Cell href={`/shop/${shopId}/daily-bill/${accDate}`} access>
    <CellBody>
      {shopName}
      <Badge preset="body">{formatNumber(transCnt)}笔</Badge>
    </CellBody>
    <CellFooter>
      {formatMoney(crAmt, '￥')}
    </CellFooter>
  </Cell>
  );

export default DeviceBill;
