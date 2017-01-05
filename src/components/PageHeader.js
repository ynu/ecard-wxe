import React, { PropTypes } from 'react';

const PageHeader = ({ title, desc }) => (
  <div className="page__hd" >
    <h1 className="page__title">{title}</h1>
    <p className="page__desc">
      {desc}
    </p>
  </div>
  );

export default PageHeader;
