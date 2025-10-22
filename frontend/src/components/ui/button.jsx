import React from 'react';

export function Button({ children, className = '', style = {}, ...props }) {
  // Simple transparent button with a subtle white border and white text
  const baseStyle = {
    border: '1px solid rgba(255,255,255,0.15)',
    backgroundColor: 'transparent',
    color: 'white',
    ...style,
  };

  return (
    <button
      {...props}
      style={baseStyle}
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
