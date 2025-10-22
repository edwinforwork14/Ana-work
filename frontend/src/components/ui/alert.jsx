import React from 'react';

export function Alert({ children }) {
  return (
    <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      {children}
    </div>
  );
}

export function AlertTitle({ children }) {
  return <div className="font-semibold text-sm">{children}</div>;
}

export function AlertDescription({ children }) {
  return <div className="text-xs text-gray-600 dark:text-gray-300">{children}</div>;
}

export default Alert;
