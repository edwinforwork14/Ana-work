// pages/DashboardStaff.jsx
import { useNavigate } from 'react-router-dom';

export default function DashboardStaff() {
  const navigate = useNavigate();
  const handleCitas = () => navigate('/staff/citas');
  const handleAlertas = () => navigate('/staff/alertas');
  const handleDocumentos = () => navigate('/staff/documentos');
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-600 mb-4">Panel del Staff</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Panel de Citas */}
        <div className="p-6 bg-white shadow rounded-lg flex flex-col h-full justify-between">
          <div>
            <h3 className="text-xl font-bold text-purple-700 mb-2">Citas</h3>
            <p className="text-gray-600">Gestiona y revisa todas las citas de los clientes.</p>
          </div>
          <div className="flex justify-end">
            <button
              className="px-3 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 text-sm"
              onClick={handleCitas}
            >
              Ir a Citas
            </button>
          </div>
        </div>
        {/* Panel de Alertas */}
        <div className="p-4 bg-white shadow rounded-lg flex flex-col h-full justify-between">
          <div>
            <h3 className="text-lg font-bold text-yellow-700 mb-2">Alertas</h3>
            <p className="text-gray-600 text-sm">Visualiza alertas y citas no confirmadas.</p>
          </div>
          <div className="flex justify-end">
            <button
              className="px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
              onClick={handleAlertas}
            >
              Ver alertas
            </button>
          </div>
        </div>
        {/* Panel de Documentos */}
        <div className="p-4 bg-white shadow rounded-lg flex flex-col h-full justify-between">
          <div>
            <h3 className="text-lg font-bold text-blue-700 mb-2">Documentos</h3>
            <p className="text-gray-600 text-sm">Gestiona documentos pendientes de revisión.</p>
          </div>
          <div className="flex justify-end">
            <button
              className="px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm"
              onClick={handleDocumentos}
            >
              Ver documentos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
