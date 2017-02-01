import React, { PropTypes } from 'react';
import { Preview, PreviewHeader, PreviewBody, PreviewItem } from 'react-weui';
import { formatMoney, formatNumber } from 'accounting';

const ShopBill = ({ bill: { crAmt, drAmt, transCnt }, accDate }) => {
  const amount = parseFloat(crAmt, 10) - parseFloat(drAmt, 10);
  return (
    <Preview>
      <PreviewHeader>
        <PreviewItem label="合计金额" value={formatMoney(amount, '￥')} />
      </PreviewHeader>
      <PreviewBody>
        <PreviewItem label="刷卡金额" value={formatMoney(crAmt, '￥')} />
      </PreviewBody>
      <PreviewBody>
        <PreviewItem label="冲正金额" value={formatMoney(drAmt, '￥')} />
      </PreviewBody>
      <PreviewBody>
        <PreviewItem label="消费笔数" value={`${formatNumber(transCnt)}笔`} />
      </PreviewBody>
      <PreviewBody>
        <PreviewItem label="报表日期" value={accDate} />
      </PreviewBody>
    </Preview>
  );
};

ShopBill.propTypes = {
  bill: PropTypes.shape({
    crAmt: PropTypes.string.isRequired,
    drAmt: PropTypes.string.isRequired,
    transCnt: PropTypes.string.isRequired,
  }).isRequired,
  accDate: PropTypes.string.isRequired,
};

export default ShopBill;
