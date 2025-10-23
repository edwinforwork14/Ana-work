import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function AdminCitas() {
  const location = useLocation();
  const navigate = useNavigate();

  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros iniciales desde la URL (por ejemplo ?desde=2025-10-22&id_staff=3)
  const qs = new URLSearchParams(location.search);
  const [desde, setDesde] = useState(qs.get('desde') || '');
  const [hasta, setHasta] = useState(qs.get('hasta') || '');
  const [filterUser, setFilterUser] = useState(qs.get('id_usuario') || '');
  const [filterStaff, setFilterStaff] = useState(qs.get('id_staff') || '');
  const [estado, setEstado] = useState(qs.get('estado') || '');
  const conDocumentos = qs.get('conDocumentos') === 'true';

  const BASE_URL = 'http://localhost:3000'; // Definir la URL base explícita

  useEffect(() => {
    const fetchCitas = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const base = conDocumentos
          ? `${BASE_URL}/api/admin/citas/con-documentos`
          : `${BASE_URL}/api/admin/citas`;

        const params = new URLSearchParams();
        if (desde) params.set('desde', desde);
        if (hasta) params.set('hasta', hasta);
        if (filterUser) params.set('id_usuario', filterUser);
        if (filterStaff) params.set('id_staff', filterStaff);
        if (estado) params.set('estado', estado);

        const url = `${base}?${params.toString()}`;
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.status === 401 || res.status === 403) {
          setError('No autorizado. Inicia sesión como admin.');
          setCitas([]);
          return;
        }
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setCitas(data.citas || []);
      } catch (err) {
        setError(err.message || 'Error cargando citas');
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, [conDocumentos, desde, hasta, filterUser, filterStaff, estado]);

  const handleViewHistorial = (id) => {
    navigate(`/admin/clientes/${id}/historial`);
  };

  const handleDownload = (id) => {
    window.open(`${BASE_URL}/api/documentos/cita/${id}`, '_blank', 'noreferrer');
  };

  const handleClear = () => {
    setDesde('');
    setHasta('');
    setFilterUser('');
    setFilterStaff('');
    setEstado('');
  };

  return (
    <div className="min-h-screen w-full bg-transparent p-8 pt-20 backdrop-blur-md text-white">
      <div className="flex md:items-center flex-col md:flex-row gap-5 md:gap-2 justify-between">
        <div className="flex flex-col gap-2 items-start text-white">
          <h3 className="text-lg font-semibold">
            {conDocumentos ? 'Citas con Documentos' : 'Panel de Citas (Admin)'}
          </h3>
          <p className="font-medium text-gray-300">
            Lista y gestión de todas las citas del sistema.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex gap-2">
          <Button onClick={() => navigate('/admin/usuarios')} className="bg-transparent text-white border-gray-600">
            Usuarios
          </Button>
          <Button onClick={() => navigate('/admin')} className="bg-transparent text-white border-gray-600">
            Panel
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap gap-3 items-center mb-4">
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="px-2 py-1 border rounded bg-gray-800 text-white" />
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="px-2 py-1 border rounded bg-gray-800 text-white" />
          <input placeholder="id_usuario" value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className="px-3 py-1 border rounded bg-gray-800 text-white w-36" />
          <input placeholder="id_staff" value={filterStaff} onChange={(e) => setFilterStaff(e.target.value)} className="px-3 py-1 border rounded bg-gray-800 text-white w-36" />
          <input placeholder="estado" value={estado} onChange={(e) => setEstado(e.target.value)} className="px-3 py-1 border rounded bg-gray-800 text-white w-36" />
          <Button onClick={handleClear} className="px-3 py-1">Limpiar</Button>
        </div>

        {loading && <p className="text-gray-400">Cargando citas...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <ul role="list" className="divide-y divide-gray-700">
            {citas.length === 0 && <li className="py-4 text-gray-400 text-center">No hay citas</li>}

            {citas.map((cita) => (
              <li key={cita.id} className="flex justify-between items-center py-5 px-4 hover:bg-gray-900/40 rounded-lg transition">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-white">{cita.motivo}</h3>
                  <div className="text-xs text-gray-400">
                    ID: {cita.id} • Usuario: {cita.id_usuario} • Staff: {cita.id_staff || '-'}
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-400">
                    <span>📅 {cita.fecha ? `${cita.fecha.slice(0, 10)}${cita.hora_12h ? ' ' + cita.hora_12h : ''}` : ''}</span>
                    <span>• Estado: {cita.estado}</span>
                    <span>• Documento: {cita.documento === true ? 'Sí' : 'No'}</span>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <Button onClick={() => handleViewHistorial(cita.id)} variant="outline" size="sm" className="bg-transparent text-white border-gray-600">
                    Historial
                  </Button>
                  {conDocumentos && (
                    <Button onClick={() => handleDownload(cita.id)} variant="outline" size="sm" className="text-blue-400 border-blue-400 hover:bg-blue-900/40 flex items-center gap-1">
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
