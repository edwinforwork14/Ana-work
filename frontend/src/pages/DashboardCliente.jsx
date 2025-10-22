// pages/DashboardCliente.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function DashboardCliente() {
  const navigate = useNavigate();
  const handleMyCitas = () => navigate('/cliente/mis-citas');
  const handleCreateCita = () => navigate('/cliente/agendar-cita');
  const handleUploadDocument = () => navigate('/cliente/subir-documento');

  const plans = [
    {
      name: 'Basic plan',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      price: 12,
      isMostPop: false,
      features: [
        'Curabitur faucibus',
        'massa ut pretium maximus',
        'Sed posuere nisi',
        'Pellentesque eu nibh et neque',
        'Suspendisse a leo',
        'Praesent quis venenatis ipsum',
        'Duis non diam vel tortor',
      ],
    },
    {
      name: 'Startup',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      price: 35,
      isMostPop: true,
      features: [
        'Curabitur faucibus',
        'massa ut pretium maximus',
        'Sed posuere nisi',
        'Pellentesque eu nibh et neque',
        'Suspendisse a leo',
        'Praesent quis venenatis ipsum',
        'Duis non diam vel tortor',
      ],
    },
    {
      name: 'Enterprise',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      price: 60,
      isMostPop: false,
      features: [
        'Curabitur faucibus',
        'massa ut pretium maximus',
        'Sed posuere nisi',
        'Pellentesque eu nibh et neque',
        'Suspendisse a leo',
        'Praesent quis venenatis ipsum',
        'Duis non diam vel tortor',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-blue-600">Panel del Cliente</h2>
        <div className="flex gap-2">
          <Button onClick={handleMyCitas} color="secondary" className="px-3 py-2 border border-blue-600 text-blue-600 rounded">Mis citas</Button>
          <Button onClick={handleCreateCita} variant="contained" color="success" className="px-3 py-2 bg-green-600 text-white rounded">Agendar</Button>
          <Button onClick={handleUploadDocument} color="secondary" className="px-3 py-2 bg-purple-600 text-white rounded">Subir</Button>
        </div>
      </div>

      <section className="py-8">
        <div className="max-w-screen-xl mx-auto px-4 text-gray-600 md:px-8">
          <div className="relative max-w-xl mx-auto sm:text-center mb-8">
            <h3 className="text-gray-800 text-3xl font-semibold sm:text-4xl">Acciones rápidas</h3>
            <div className="mt-3 max-w-xl">
              <p>Accede rápidamente a tus citas, agenda una nueva o sube documentos.</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mis Citas */}
            <div className="p-6 bg-white/90 dark:bg-gray-800/80 rounded-xl shadow flex flex-col justify-between">
              <div>
                <h4 className="text-xl font-bold text-blue-600 mb-2">Mis Citas</h4>
                <p className="text-gray-700 dark:text-gray-200">Revisa y administra tus citas pendientes y pasadas.</p>
              </div>
              <div className="mt-6">
                <Button onClick={handleMyCitas} color="secondary" className="w-full px-4 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50">Ver mis citas</Button>
              </div>
            </div>

            {/* Agendar Cita */}
            <div className="p-6 bg-white/90 dark:bg-gray-800/80 rounded-xl shadow flex flex-col justify-between">
              <div>
                <h4 className="text-xl font-bold text-green-600 mb-2">Agendar una cita</h4>
                <p className="text-gray-700 dark:text-gray-200">Programa una nueva cita en el horario que prefieras.</p>
              </div>
              <div className="mt-6">
                <Button onClick={handleCreateCita} variant="contained" color="success" className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700">Agendar cita</Button>
              </div>
            </div>

            {/* Subir Documento */}
            <div className="p-6 bg-white/90 dark:bg-gray-800/80 rounded-xl shadow flex flex-col justify-between">
              <div>
                <h4 className="text-xl font-bold text-purple-600 mb-2">Subir un documento</h4>
                <p className="text-gray-700 dark:text-gray-200">Adjunta documentos necesarios para tus citas o trámites.</p>
              </div>
              <div className="mt-6">
                <Button onClick={handleUploadDocument} color="secondary" className="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700">Subir documento</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
