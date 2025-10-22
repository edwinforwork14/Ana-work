// pages/DashboardAdmin.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const handleAgendas = () => navigate('/admin/citas');
  const handleQuickbooks = () => {
    // placeholder: would navigate or open quickbooks integration
    window.open('https://quickbooks.intuit.com', '_blank');
  };
  const handleUsuarios = () => navigate('/admin/usuarios');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-blue-600">Panel del Administrador</h2>
        <div className="flex gap-2">
          <Button onClick={handleAgendas} color="secondary" className="px-3 py-2 border border-blue-600 text-blue-600 rounded">Agendas</Button>
          <Button onClick={handleQuickbooks} variant="contained" color="success" className="px-3 py-2 bg-green-600 text-white rounded">QuickBooks</Button>
          <Button onClick={handleUsuarios} color="secondary" className="px-3 py-2 bg-gray-600 text-white rounded">Usuarios</Button>
        </div>
      </div>

      <section className="py-8">
        <div className="max-w-screen-xl mx-auto px-4 text-gray-600 md:px-8">
          <div className="relative max-w-xl mx-auto sm:text-center mb-8">
            <h3 className="text-gray-800 text-3xl font-semibold sm:text-4xl">Acciones rápidas</h3>
            <div className="mt-3 max-w-xl">
              <p>Administra agendas, usuarios y la integración con QuickBooks desde aquí.</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/90 dark:bg-gray-800/80 rounded-xl shadow flex flex-col justify-between">
              <div>
                <h4 className="text-xl font-bold text-purple-700 mb-2">Agendas</h4>
                <p className="text-gray-700 dark:text-gray-200">Revisa y administra las agendas de los staff.</p>
              </div>
              <div className="mt-6">
                <Button onClick={handleAgendas} color="secondary" className="w-full px-4 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50">Ver agendas</Button>
              </div>
            </div>

            <div className="p-6 bg-white/90 dark:bg-gray-800/80 rounded-xl shadow flex flex-col justify-between">
              <div>
                <h4 className="text-xl font-bold text-green-600 mb-2">QuickBooks</h4>
                <p className="text-gray-700 dark:text-gray-200">Administrar la integración contable y facturación.</p>
              </div>
              <div className="mt-6">
                <Button onClick={handleQuickbooks} variant="contained" color="success" className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700">Abrir QuickBooks</Button>
              </div>
            </div>

            <div className="p-6 bg-white/90 dark:bg-gray-800/80 rounded-xl shadow flex flex-col justify-between">
              <div>
                <h4 className="text-xl font-bold text-blue-700 mb-2">Usuarios</h4>
                <p className="text-gray-700 dark:text-gray-200">Gestiona usuarios, roles y permisos del sistema.</p>
              </div>
              <div className="mt-6">
                <Button onClick={handleUsuarios} color="secondary" className="w-full px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700">Gestionar usuarios</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
