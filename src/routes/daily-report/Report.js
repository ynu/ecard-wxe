import React, { PropTypes } from 'react';
import { Toast, CellsTitle, Cells, LoadMore,
  Preview, PreviewHeader, PreviewBody, PreviewItem } from 'react-weui';
import { connect } from 'react-redux';
import { formatMoney, formatNumber } from 'accounting';
import Container from '../../components/Weui/Container';
import PageHeader from '../../components/PageHeader';
import Footer from '../../components/Footer';
import EnsureSignupWxe from '../../components/WeChat/EnsureSignupWxe';
import dailyActions from '../../actions/daily';
import SubShopBill from './SubShopBill';
import DeviceBill from './DeviceBill';
import ShopBill from './ShopBill';

class Report extends React.Component {
  static propTypes = {
    shopId: PropTypes.string.isRequired,
    accDate: PropTypes.string.isRequired,
    getShopBill: PropTypes.func.isRequired,
    shopBill: PropTypes.object.isRequired,
    subShopBills: PropTypes.array.isRequired,
    deviceBills: PropTypes.array.isRequired,
    toast: PropTypes.object.isRequired,
  };
  componentDidMount() {
    const { shopId, accDate, getShopBill } = this.props;
    getShopBill(shopId, accDate);
  }
  render() {
    const { shopBill, subShopBills, deviceBills, toast, accDate } = this.props;
    return (
      <Container>
        <EnsureSignupWxe />
        <PageHeader title={shopBill.shopName} />
        <div className="page__bd">
          <ShopBill bill={shopBill} accDate={accDate} />

          <CellsTitle>子商户</CellsTitle>
          <Cells>
            { subShopBills.length
              ? subShopBills.map(bill => <SubShopBill bill={bill} />)
              : <LoadMore showLine>暂无数据</LoadMore>
            }
          </Cells>
          <CellsTitle>设备</CellsTitle>
          <Cells>
            {
              deviceBills.length
              ? deviceBills.map(bill => <DeviceBill bill={bill} />)
              : <LoadMore showLine>暂无数据</LoadMore>
            }
          </Cells>
        </div>
        <Footer />
        <Toast icon={toast.icon} show={toast.loading} >加载中</Toast>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  toast: state.wechat.toast,
  ...state.shop.dailyBill,
});
export default connect(mapStateToProps, {
  ...dailyActions,
})(Report);
