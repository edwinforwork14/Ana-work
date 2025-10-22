import React from 'react';

export function TryItButton({ children = 'Try It Out', className = '' }) {
  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      className={`block w-full mt-2 py-2.5 px-8 text-gray-700 bg-white rounded-md duration-150 hover:bg-gray-100 sm:w-auto ${className}`}
    >
      {children}
    </a>
  );
}

export function GetStartedButton({ children = 'Get Started', className = '' }) {
  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      className={`block w-full mt-2 py-2.5 px-8 text-gray-300 bg-gray-700 rounded-md duration-150 hover:bg-gray-800 sm:w-auto ${className}`}
    >
      {children}
    </a>
  );
}

export default function CTAButtons({ className = '' }) {
  return (
    <div className={`mt-5 items-center justify-center gap-3 sm:flex ${className}`}>
      <TryItButton />
      <GetStartedButton />
    </div>
  );
}
