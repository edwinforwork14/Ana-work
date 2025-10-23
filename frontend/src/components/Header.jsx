import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AnimatedGradientText from './AnimatedGradientText';
import NotificationsBell from './NotificationsBell';
import Button from './ui/button';

export default function Header({ isAuthenticated, userInfo, onLogout }) {
  // small inline ProfileMenu used in navbar
  function ProfileMenu({ isAuthenticated, userInfo, onLogout }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
      function onDocClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
      window.addEventListener('click', onDocClick);
      return () => window.removeEventListener('click', onDocClick);
    }, []);
    return (
      <div className="relative" ref={ref}>
        <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }} className="flex items-center gap-3 rounded-full border border-gray-700 px-3 py-1.5 hover:bg-gray-800 bg-black text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
          <span className="h-6 w-6 rounded-full bg-gray-700 text-white flex items-center justify-center text-sm">{(userInfo && userInfo.nombre) ? userInfo.nombre.charAt(0).toUpperCase() : 'U'}</span>
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 text-gray-800">
            <div className="p-2 text-sm border-b">{isAuthenticated ? `Hola, ${userInfo.nombre || 'Usuario'}` : 'Cuenta'}</div>
            <div className="flex flex-col text-sm">
               {isAuthenticated && <Link to="/notificaciones" className="px-3 py-2 hover:bg-gray-100">notificationes</Link>}
              {isAuthenticated && <button onClick={() => { onLogout(); setOpen(false); }} className="text-left px-3 py-2 hover:bg-gray-100">Cerrar sesión</button>}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <nav className="fixed top-0 z-50 w-full bg-black">
      <div className="max-w-[2520px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 md:gap-0">
          {/* Left / Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-white text-lg font-bold">
              <span className="hidden sm:inline-block"><AnimatedGradientText /></span>
              <span className="inline-block sm:hidden"><AnimatedGradientText text={"Ana’s"} /></span>
            </Link>
          </div>


          {/* Right section */}
          <div className="flex items-center gap-2 md:gap-0">
            <button className="text-gray-300 hover:text-white hover:bg-gray-800 p-2 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path d="M2.05 12H21.95" /></svg>
            </button>

          {/* Conditional buttons based on authentication */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden sm:inline-block">
                  <Button className="px-3 py-1">Iniciar</Button>
                </Link>
                <Link to="/register" className="hidden sm:inline-block">
                  <Button className="px-3 py-1">Crear cuenta</Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Notifications bell */}
                <NotificationsBell />
                <ProfileMenu isAuthenticated={isAuthenticated} userInfo={userInfo} onLogout={onLogout} />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
