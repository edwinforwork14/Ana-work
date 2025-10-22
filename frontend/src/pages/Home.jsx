import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AnimatedGradientText from '../components/AnimatedGradientText';


export default function Home({ isAuthenticated, userInfo }) {
  const navigate = useNavigate();
  const goToDashboard = () => {
    // If userInfo is provided (injected by WithBackground), use the role to decide
    const rol = (userInfo && userInfo.rol) ? userInfo.rol.toLowerCase() : null;
    if (rol === 'staff') return navigate('/staff');
    if (rol === 'admin') return navigate('/admin');
    // default -> cliente
    return navigate('/cliente');
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent text-white">
      <div className="max-w-3xl text-center p-8">
        <div className="mb-4">
          <AnimatedGradientText text={"Bienvenido a Ana’s Accounting"} />
        </div>
        <p className="text-lg mb-6 opacity-90">Gestiona tus citas, documentos y notificaciones desde un mismo lugar.</p>

        <div className="flex flex-col gap-4 items-center justify-center">
          {!isAuthenticated ? (
            <>
              <p className="text-lg">Inicia sesión o regístrate para usar nuestros servicios</p>
              <div className="flex gap-4">
              </div>
            </>
          ) : (
              <div className="flex gap-4">
                <Button variant="outlined" onClick={goToDashboard} style={{ border: '1px solid #16a34a', color: '#16a34a' }} className="px-6 py-3 rounded-md">Ir al panel</Button>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
