
import React from 'react';
import './Button.css';

const Button = ({ className, variant = "primary", size = "default", children, ...props }) => {
  const buttonClass = `btn btn-${variant} btn-${size} ${className || ''}`;
  
  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
};

export default Button;
