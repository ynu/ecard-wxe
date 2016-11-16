import React, { PropTypes } from 'react';

function Container({ children }) {
  return (
    <div className="container" style={{ overflowY: 'auto' }}>
      {children}
    </div>
  );
}

Container.propTypes = {
  children: PropTypes.element.isRequired,
};

export default Container;
