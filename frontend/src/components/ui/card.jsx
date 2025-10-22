import React from 'react';

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-white dark:bg-gray-800 border rounded-lg p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`mb-2 ${className}`}>{children}</div>;
}

export function CardAction({ children, className = '' }) {
  return <div className={`mt-2 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = '' }) {
  return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
}

export function CardContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`mt-4 ${className}`}>{children}</div>;
}

export default Card;
