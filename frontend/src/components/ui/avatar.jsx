import React from 'react';

export function Avatar({ children, className = '', ...props }) {
  return (
    <div {...props} className={`inline-flex items-center justify-center overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt, className = '', ...props }) {
  return (
    <img src={src} alt={alt} className={`block h-full w-full object-cover ${className}`} {...props} />
  );
}

export function AvatarFallback({ children, className = '', ...props }) {
  return (
    <div {...props} className={`flex items-center justify-center bg-gray-300 text-gray-700 ${className}`}>
      {children}
    </div>
  );
}

export default Avatar;
