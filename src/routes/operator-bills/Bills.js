import React, { PropTypes } from 'react';
import { Toast, CellsTitle, Cells, Preview, PreviewHeader, PreviewFooter, PreviewBody, PreviewItem, PreviewButton } from 'react-weui';
import { connect } from 'react-redux';
import { formatMoney, formatNumber } from 'accounting';
import Container from '../../components/Weui/Container';
import PageHeader from '../../components/PageHeader';
import Footer from '../../components/Footer';
import EnsureSignupWxe from '../../components/WeChat/EnsureSignupWxe';
import actions from '../../actions/daily';

class Bills extends React.Component {
  static propTypes = {
    accDate: PropTypes.string.isRequired,
    getOperatorBills: PropTypes.func.isRequired,
    operatorBills: PropTypes.array.isRequired,
    toast: PropTypes.object.isRequired,
  };
  componentDidMount() {
    const { accDate, getOperatorBills } = this.props;
    getOperatorBills(accDate);
  }
  render() {
    const { operatorBills, accDate, toast } = this.props;
    const total = Object.entries(operatorBills).reduce((acc, cur) => {
      const [, bills] = cur;
      const result = bills.reduce((acc, cur) => ({
        inAmt: acc.inAmt + cur.inAmt,
        outAmt: acc.outAmt + cur.outAmt,
        transCnt: acc.transCnt + cur.transCnt,
      }), { inAmt: 0, outAmt: 0, transCnt: 0 });
      return {
        inAmt: acc.inAmt + result.inAmt,
        outAmt: acc.outAmt + result.outAmt,
        transCnt: acc.transCnt + result.transCnt,
      };
    }, { inAmt: 0, outAmt: 0, transCnt: 0 });
    return (
      <Container>
        <EnsureSignupWxe />
        <PageHeader title="操作员账单" desc={''} />
        <div className="page__bd">
          <Preview>
            <PreviewHeader>
              <PreviewItem label="" value="合计数" />
            </PreviewHeader>
            <PreviewBody>
              <PreviewItem label="日期" value={accDate} />
              <PreviewItem label="合计金额" value={`${formatMoney(total.inAmt - total.outAmt, '￥')}`} />
              <PreviewItem label="收入金额" value={`${formatMoney(total.inAmt, '￥')}`} />
              <PreviewItem label="支出金额" value={`${formatMoney(total.outAmt, '￥')}`} />
              <PreviewItem label="交易次数" value={`${formatNumber(total.transCnt)}笔`} />
            </PreviewBody>
          </Preview>
          <br />
          {
            Object.entries(operatorBills).map(([name, bills]) => (
              <div>
                <Preview>
                  <PreviewHeader>
                    <PreviewItem label="操作员" value={name} />
                  </PreviewHeader>

                  <PreviewBody>
                    {
                      bills.map(({ inAmt, outAmt, transCnt, subjName, summary }) => (
                        <PreviewItem
                          label={`${subjName}(${summary})`}
                          value={`${formatMoney(inAmt - outAmt, '￥')} | ${formatNumber(transCnt)}笔`}
                        />
                      ))
                    }
                  </PreviewBody>
                </Preview>
                <br />
              </div>
            ))
          }
        </div>
        <Footer />
        <Toast icon={toast.icon} show={toast.loading} >加载中</Toast>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  toast: state.wechat.toast,
  ...state.shop,
});
export default connect(mapStateToProps, {
  ...actions,
})(Bills);
