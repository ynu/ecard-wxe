import React, { PropTypes } from 'react';

class NeedSignup extends React.Component {
  static propTypes = {
    getMe: PropTypes.func,
    success: PropTypes.func,
    fail: PropTypes.func,
    error: PropTypes.func,
  };
  static defaultProps = {
    getMe: async () => null,
    success: data => data,
    fail: e => console.error('NeedSignup Error:', e), // eslint-disable-line
  };
  async componentDidMount() {
    const { getMe, success, fail } = this.props;
    try {
      const result = await getMe();
      success(result);
    } catch (e) {
      fail(e);
    }
  }
  render() {
    return null;
  }
}

export default NeedSignup;
