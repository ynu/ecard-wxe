import React, { PropTypes } from 'react';
import { Toast, CellsTitle, Cells, LoadMore,
  Preview, PreviewHeader, PreviewBody, PreviewItem } from 'react-weui';
import { connect } from 'react-redux';
import { formatMoney, formatNumber } from 'accounting';
import Container from '../../components/Weui/Container';
import PageHeader from '../../components/PageHeader';
import Footer from '../../components/Footer';
import dailyActions from '../../actions/daily';
import SubShopBill from './SubShopBill';
import DeviceBill from './DeviceBill';

class Report extends React.Component {
  componentDidMount() {
    const { shopId, accDate, getShopBill } = this.props;
    getShopBill(shopId, accDate);
  }
  render() {
    const { shopBill, subShopBills, deviceBills, loading } = this.props;
    return (
      <Container>
        <PageHeader title={shopBill.shopName} />
        <div className="page__bd">
          <Preview>
            <PreviewHeader>
              <PreviewItem label="合计金额" value={formatMoney(shopBill.crAmt, '￥')} />
            </PreviewHeader>
            <PreviewBody>
              <PreviewItem label="消费笔数" value={`${formatNumber(shopBill.transCnt)}笔`} />
            </PreviewBody>
          </Preview>
          <CellsTitle>子商户</CellsTitle>
          <Cells>
            { subShopBills.length
              ? subShopBills.map(bill => <SubShopBill bill={bill} />)
              : <LoadMore showLine showDot />
            }
          </Cells>
          <CellsTitle>设备</CellsTitle>
          <Cells>
            {
              deviceBills.length
              ? deviceBills.map(bill => <DeviceBill bill={bill} />)
              : <LoadMore showLine showDot />
            }
          </Cells>
        </div>
        <Footer />
        <Toast loading show={loading} >加载中</Toast>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.wechat.toast.loading,
  ...state.shop.dailyBill,
});
export default connect(mapStateToProps, {
  ...dailyActions,
})(Report);
