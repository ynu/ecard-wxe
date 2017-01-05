import mysql from 'mysql';

export default class YktManager {
  constructor(options) {
    this.url = options.url;
    // this.connection = mysql.createConnection(this.url);
  }
  async getShopBill(shopId, accDate) {
    return {
      shopId: 9999,
      shopName: 'Test',
      accDate: '20220202',
      transCnt: 93,
      crAmt: 345,
      drAmt: 4232,
    };
  }
  getDeviceBill(deviceId) {

  }
  getTotalBill() {

  }
  getDevices(shopId) {

  }
  getSubShops(fatherId) {

  }
  async getShops() {
    return [9999];
  }
}
