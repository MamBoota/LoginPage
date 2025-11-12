import React from 'react';
import PropTypes from 'prop-types';

const Spinner = ({ size = 'default' }) => {
  const sizeStyles = {
    small: { width: '16px', height: '16px' },
    default: { width: '24px', height: '24px' },
    large: { width: '32px', height: '32px' },
  };

  return (
    <div className="spinner" style={sizeStyles[size] || sizeStyles.default}>
      <div className="spinner-dot"></div>
      <div className="spinner-dot"></div>
    </div>
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['small', 'default', 'large']),
};

export default Spinner;
