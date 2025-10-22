import React from 'react';

export function Eye(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
    </svg>
  );
}

export function EyeOff(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M17.94 17.94A10.97 10.97 0 0 1 12 19c-7 0-11-7-11-7 1.7-3 4.13-5.23 7.06-6.48" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1 1l22 22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default { Eye, EyeOff };
