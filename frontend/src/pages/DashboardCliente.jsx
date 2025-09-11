// pages/DashboardCliente.jsx
export default function DashboardCliente() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-600">Panel del Cliente</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Card Citas */}
        <div className="p-6 bg-white shadow rounded-lg">
          <h3 className="text-xl font-bold text-blue-600 mb-2">Mis Citas</h3>
          <p className="text-gray-600">Próxima cita: 15/09/2025 - 10:00 AM</p>
          <p className="text-gray-500">Estado: Confirmada</p>
        </div>
        {/* Card Documentos */}
        <div className="p-6 bg-white shadow rounded-lg">
          <h3 className="text-xl font-bold text-green-600 mb-2">Documentos</h3>
          <p className="text-gray-600">Checklist: 3 documentos pendientes.</p>
          <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Subir documento
          </button>
        </div>
        {/* Card Recordatorios */}
        <div className="p-6 bg-white shadow rounded-lg">
          <h3 className="text-xl font-bold text-purple-600 mb-2">Recordatorios</h3>
          <p className="text-gray-600">Próximo: Enviar comprobante antes de la cita.</p>
        </div>
      </div>
    </div>
  );
}
