// pages/DashboardStaff.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function DashboardStaff() {
  const navigate = useNavigate();
  const handleCitas = () => navigate('/staff/citas');
  const handleAlertas = () => navigate('/staff/alertas');
  const handleDocumentos = () => navigate('/staff/documentos');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-blue-600">Panel del Staff</h2>
        <div className="flex gap-2">
          <Button onClick={handleCitas} color="secondary" className="px-3 py-2 border border-blue-600 text-blue-600 rounded">Citas</Button>
          <Button onClick={handleAlertas} variant="contained" color="warning" className="px-3 py-2 bg-yellow-500 text-white rounded">Alertas</Button>
          <Button onClick={handleDocumentos} color="secondary" className="px-3 py-2 bg-purple-600 text-white rounded">Documentos</Button>
        </div>
      </div>

      <section className="py-8">
        <div className="max-w-screen-xl mx-auto px-4 text-gray-600 md:px-8">
          <div className="relative max-w-xl mx-auto sm:text-center mb-8">
            <h3 className="text-gray-800 text-3xl font-semibold sm:text-4xl">Acciones rápidas</h3>
            <div className="mt-3 max-w-xl">
              <p>Gestiona tus citas, revisa alertas y administra documentos desde aquí.</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/90 dark:bg-gray-800/80 rounded-xl shadow flex flex-col ">
              <div>
                <h4 className="text-xl font-bold text-purple-700 mb-2">Citas</h4>
                <p className="text-gray-700 dark:text-gray-200">Gestiona y revisa todas las citas de los clientes.</p>
              </div>
              <div className="mt-6">
                <Button onClick={handleCitas} color="secondary" className="w-full px-4 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50">Ir a Citas</Button>
              </div>
            </div>


            <div className="p-6 bg-white/90 dark:bg-gray-800/80 rounded-xl shadow flex flex-col ">
              <div>
                <h4 className="text-xl font-bold text-blue-700 mb-2">Documentos</h4>
                <p className="text-gray-700 dark:text-gray-200">Gestiona documentos pendientes de revisión.</p>
              </div>
              <div className="mt-6">
                <Button onClick={handleDocumentos} color="secondary" className="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700">Ver documentos</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
