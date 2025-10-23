// pages/DashboardAdmin.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function formatDateISO(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('day');
  const [fecha, setFecha] = useState(formatDateISO());
  const [idStaff, setIdStaff] = useState('');

  // 🔹 Estados de métricas
  const [totalCitas, setTotalCitas] = useState(0);
  const [totalDocumentos, setTotalDocumentos] = useState(0);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [error, setError] = useState(null);

  const handleAgendas = () => navigate('/admin/citas');
  const handleQuickbooks = () => window.open('https://quickbooks.intuit.com', '_blank');
  const handleUsuarios = () => navigate('/admin/usuarios');

  // =============================
  // 🔹 Cargar total de citas
  // =============================
  useEffect(() => {
    const loadCitas = async () => {
      setLoadingCitas(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/citas', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setTotalCitas(Array.isArray(data) ? data.length : 0);
      } catch (err) {
        setError(err.message || 'Error cargando citas');
      } finally {
        setLoadingCitas(false);
      }
    };
    loadCitas();
  }, []);

  // =============================
  // 🔹 Cargar total de documentos
  // =============================
  useEffect(() => {
    const loadDocumentos = async () => {
      setLoadingDocs(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/documentos/count', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();

        // ✅ Aquí el cambio: usar "data.total"
        setTotalDocumentos(data.total || 0);
      } catch (err) {
        setError(err.message || 'Error cargando documentos');
      } finally {
        setLoadingDocs(false);
      }
    };
    loadDocumentos();
  }, []);

  const handleOpenCitasFiltered = () => {
    const qs = new URLSearchParams();
    if (fecha) qs.set('desde', fecha);
    if (fecha) qs.set('hasta', fecha);
    if (idStaff) qs.set('id_staff', idStaff);
    navigate(`/admin/citas?${qs.toString()}`);
  };

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

      <section className="py-6">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="space-x-2">
                <Button onClick={() => setPeriod('day')} className={`px-3 py-1 rounded ${period === 'day' ? 'bg-blue-600 text-white' : 'bg-white/90 text-gray-800'}`}>Día</Button>
                <Button onClick={() => setPeriod('week')} className={`px-3 py-1 rounded ${period === 'week' ? 'bg-blue-600 text-white' : 'bg-white/90 text-gray-800'}`}>Semana</Button>
                <Button onClick={() => setPeriod('month')} className={`px-3 py-1 rounded ${period === 'month' ? 'bg-blue-600 text-white' : 'bg-white/90 text-gray-800'}`}>Mes</Button>
              </div>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="px-3 py-1 rounded border" />
              <input placeholder="Filtrar por id_staff" value={idStaff} onChange={e => setIdStaff(e.target.value)} className="px-3 py-1 rounded border w-44" />
              <Button onClick={handleOpenCitasFiltered} className="px-3 py-1 bg-gray-800 text-white rounded">Ver citas filtradas</Button>
            </div>
            <div className="text-sm text-gray-600">Periodo: <strong>{period}</strong></div>
          </div>

          {/* ===============================
              BLOQUES DE MÉTRICAS PRINCIPALES
          =============================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* 🔹 Total de Citas */}
            <div className="p-6 bg-white/90 dark:bg-gray-800/80 rounded-xl shadow">
              <h4 className="text-lg font-semibold">Total de citas</h4>
              <div className="text-3xl font-bold mt-3">
                {loadingCitas ? '...' : totalCitas}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Total registradas en la base de datos
              </div>
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>

            {/* 🔹 Documentos subidos */}
            <div className="p-6 bg-white/90 dark:bg-gray-800/80 rounded-xl shadow">
              <h4 className="text-lg font-semibold">Documentos subidos</h4>
              <div className="text-3xl font-bold mt-3">
                {loadingDocs ? '...' : totalDocumentos}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Total registrados en la base de datos
              </div>
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>

            {/* 🔹 Placeholder de estados */}
            <div className="p-6 bg-white/90 dark:bg-gray-800/80 rounded-xl shadow">
              <h4 className="text-lg font-semibold">Estados</h4>
              <div className="mt-3 text-gray-500 text-sm">En desarrollo</div>
            </div>
          </div>

          {/* ===============================
              ACCIONES RÁPIDAS
          =============================== */}
          <div className="mt-8 bg-white/90 dark:bg-gray-800/80 rounded-xl shadow p-4">
            <h4 className="text-lg font-semibold mb-3">Acciones rápidas</h4>
            <div className="flex flex-col md:flex-row gap-3">
              <Button onClick={handleAgendas} className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md">Ver todas las agendas</Button>
              <Button onClick={() => navigate('/admin/citas?conDocumentos=true')} className="px-4 py-2 bg-yellow-500 text-white rounded-md">Citas con documentos</Button>
              <Button onClick={() => navigate('/admin/usuarios')} className="px-4 py-2 bg-gray-600 text-white rounded-md">Gestionar usuarios</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
