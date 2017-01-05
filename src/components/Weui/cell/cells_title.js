/*
eslint-disable
 */



import React from 'react';
import classNames from 'classnames';

export default class CellsTitle extends React.Component {
    render() {
        const {className, children, ...others} = this.props;
        const cls = classNames({
            'weui-cells__title': true,
            [className]: className
        });

        return (
            <div className={cls} {...others}>{children}</div>
        );
    }
};
