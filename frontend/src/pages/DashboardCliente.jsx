// pages/DashboardCliente.jsx
import { useNavigate } from 'react-router-dom';

export default function DashboardCliente() {
  const navigate = useNavigate();
  const handleMyCitas = () => navigate('/cliente/mis-citas');
  const handleCreateCita = () => navigate('/cliente/agendar-cita');
  const handleUploadDocument = () => navigate('/cliente/subir-documento');
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-600">Panel del Cliente</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Card Citas */}
        <div className="p-6 bg-white shadow rounded-lg flex flex-col h-full justify-between">
          <div>
            <h3 className="text-xl font-bold text-blue-600 mb-2">Mis Citas</h3>
            <p className="text-gray-600">Próxima cita: 15/09/2025 - 10:00 AM</p>
            <p className="text-gray-500">Estado: Confirmada</p>
          </div>
          <div className="flex justify-end">
            <button
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              onClick={handleMyCitas}
            >
              Ver todas mis citas
            </button>
          </div>
        </div>
        {/* Card Agendar Cita */}
        <div className="p-4 bg-white shadow rounded-lg flex flex-col h-full justify-between">
          <div>
            <h3 className="text-lg font-bold text-green-600 mb-2">Agendar una cita</h3>
            <p className="text-gray-600 text-sm">¿Necesitas una nueva cita? Haz clic abajo para agendar.</p>
          </div>
          <div className="flex justify-end">
            <button
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              onClick={handleCreateCita}
            >
              Agendar cita
            </button>
          </div>
        </div>
        {/* Card Subir Documento */}
        <div className="p-4 bg-white shadow rounded-lg flex flex-col h-full justify-between">
          <div>
            <h3 className="text-lg font-bold text-purple-600 mb-2">Subir un documento</h3>
            <p className="text-gray-600 text-sm">Adjunta tus documentos necesarios para la cita.</p>
          </div>
          <div className="flex justify-end">
            <button
              className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
              onClick={handleUploadDocument}
            >
              Subir documento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
