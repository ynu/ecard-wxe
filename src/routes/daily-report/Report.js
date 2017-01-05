import React, { PropTypes } from 'react';
import { Toast, CellsTitle, Cells, Cell, CellHeader, CellBody, CellFooter, Badge,
  Preview, PreviewHeader, PreviewFooter, PreviewBody, PreviewItem, PreviewButton } from 'react-weui';
import { connect } from 'react-redux';
import Container from '../../components/Weui/Container';
import PageHeader from '../../components/PageHeader';
import Footer from '../../components/Footer';

class Report extends React.Component {
  render() {
    const { shop, subShops, loading } = this.props;
    return (
      <Container>
        <PageHeader title={shop.shopName} />
        <div className="page__bd">
          <Preview>
            <PreviewHeader>
              <PreviewItem label="合计金额" value="$49.99" />
            </PreviewHeader>
            <PreviewBody>
              <PreviewItem label="消费笔数" value="3dd" />
            </PreviewBody>
          </Preview>
          <CellsTitle>子商户</CellsTitle>
          <Cells>
            <Cell href="javascript:;" access>
              <CellBody>
                子商户1子商户1子商户1子商户1子商户1子商户1子商户1子商户1
                <Badge preset="body">8笔</Badge>
              </CellBody>
              <CellFooter>
                32233.44元
              </CellFooter>
            </Cell>
          </Cells>
          <CellsTitle>设备</CellsTitle>
          <Cells>
            <Cell href="javascript:;" access>
              <CellBody>
                子商户1子商户1子商户1子商户1子商户1子商户1子商户1子商户1
                <Badge preset="body">8笔</Badge>
              </CellBody>
              <CellFooter>
                32233.44元
              </CellFooter>
            </Cell>
          </Cells>
        </div>
        <Footer />
        <Toast loading show={loading} >加载中</Toast>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  loading: false, //state.toast.loading,
});
export default Report;
