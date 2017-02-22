import React, { PropTypes } from 'react';
import { Cell, CellBody, CellFooter, Badge } from 'react-weui';
import { formatMoney, formatNumber } from 'accounting';

const DeviceBill = ({ bill: { transCnt, crAmt, drAmt, deviceName } }) => {
  const amount = parseFloat(crAmt, 10) - parseFloat(drAmt, 10);
  return (
    <Cell>
      <CellBody>
        {deviceName}
        <Badge preset="body">{formatNumber(transCnt)}笔</Badge>
      </CellBody>
      <CellFooter>
        {formatMoney(amount, '￥')}
      </CellFooter>
    </Cell>
  );
};

DeviceBill.propTypes = {
  bill: PropTypes.shape({
    crAmt: PropTypes.string.isRequired,
    drAmt: PropTypes.string.isRequired,
    transCnt: PropTypes.string.isRequired,
    deviceName: PropTypes.string.isRequired,
  }).isRequired,
};
export default DeviceBill;
