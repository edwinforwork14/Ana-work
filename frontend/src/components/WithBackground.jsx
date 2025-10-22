import React from 'react';
import { Meteors } from './ui/shadcn-io/meteors';
import Header from './Header';

// WithBackground now accepts auth props and forwards them to Header so the
// header can render according to authentication state.
export default function WithBackground({ children, isAuthenticated, userInfo, onLogout }) {
  // If `children` is a single React element, clone it and inject auth props so
  // pages like Home can read `isAuthenticated` without App needing to pass it
  // explicitly to every page.
  const childWithProps = React.isValidElement(children)
    ? React.cloneElement(children, { isAuthenticated, userInfo, onLogout })
    : children;

  return (
    <div className="relative min-h-screen bg-black text-white">
      <Meteors number={40} color="#8b5cf6" />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header isAuthenticated={isAuthenticated} userInfo={userInfo} onLogout={onLogout} />
        <main>{childWithProps}</main>
      </div>
    </div>
  );
}

