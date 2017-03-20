/**
 * Created by jf on 15/10/27.
 */



import React from 'react';
import classNames from 'classnames';
import Mask from '../mask/index';


class Toast extends React.Component {
    static propTypes = {
        icon: React.PropTypes.string,
        iconSize: React.PropTypes.string,
        show: React.PropTypes.bool,
        loading: React.PropTypes.bool,
        success: React.PropTypes.bool,
    };

    static defaultProps = {
        icon: 'toast',
        show: false,
        success: false,
    };

    render() {
        const {icon, show, children, iconSize, loading, success} = this.props;
        const iconCls = classNames({
          'weui-icon_toast': true,
          'weui-loading': loading,
          'weui-icon-success-no-circle': success,
        });
        return (
            <div style={{display: show ? 'block' : 'none'}}>
                <Mask transparent={true}/>
                <div className="weui-toast">
                    <i className={iconCls} />
                    <p className="weui-toast__content">{children}</p>
                </div>
            </div>
        );
    }
}

export default Toast;
