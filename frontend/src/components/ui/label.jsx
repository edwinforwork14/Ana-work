import React from 'react';

export function Label({ children, htmlFor, className = '' }) {
  return (
    <label htmlFor={htmlFor} className={`text-sm font-medium text-gray-700 dark:text-gray-200 ${className}`}>
      {children}
    </label>
  );
}

export default Label;
