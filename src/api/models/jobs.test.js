/* eslint-env mocha */
import 'babel-polyfill';
import moment from 'moment';

const getRecentMonth = moment => {
  const day = moment.date();
  if (day > 25) return moment.format('YYYYMM');
  return moment.subtract(1, 'months').format('YYYYMM');
};

describe('Jobs', function () {
  this.timeout(600000);
  it('getRecentMonth', async () => {
    const date = moment('2017-01-01');
    console.log('#########', getRecentMonth(date));
  });
});
