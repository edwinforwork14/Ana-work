import React from 'react';

export function Input(props) {
  const { className = '', ...rest } = props;
  return <input {...rest} className={`px-3 py-2 border rounded-md ${className}`} />;
}

export default Input;
