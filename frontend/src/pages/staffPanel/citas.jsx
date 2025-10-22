import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function StaffCitas() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userCitasId, setUserCitasId] = useState('');
  const [userCitas, setUserCitas] = useState([]);
  const [userCitasLoading, setUserCitasLoading] = useState(false);
  const [userCitasError, setUserCitasError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/citas', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) throw new Error('Error al obtener citas');
        const data = await res.json();
        setCitas(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, []);

  const handleDeleteCita = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta cita?')) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/citas/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('No se pudo eliminar la cita');
      setCitas(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleBuscarCitasUsuario = async (e) => {
    e.preventDefault();
    setUserCitas([]);
    setUserCitasError(null);
    if (!userCitasId) return;
    setUserCitasLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/citas/usuario/${userCitasId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('No se encontraron citas para este usuario');
      const data = await res.json();
      setUserCitas(data);
    } catch (err) {
      setUserCitasError(err.message);
    } finally {
      setUserCitasLoading(false);
    }
  };

  const applyDateFilter = (items) => {
    if (!startDate && !endDate) return items;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return items.filter(i => {
      if (!i.fecha) return false;
      const f = new Date(i.fecha);
      if (start && f < start) return false;
      if (end) {
        // include entire end day
        const endOfDay = new Date(end);
        endOfDay.setHours(23,59,59,999);
        if (f > endOfDay) return false;
      }
      return true;
    });
  };

  const handleConfirmCita = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/citas/${id}/confirmar`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!res.ok) throw new Error('No se pudo confirmar la cita');
      const data = await res.json();
      // update local state
      setCitas(prev => prev.map(c => c.id === id ? { ...c, estado: 'confirmada' } : c));
      setUserCitas(prev => prev.map(c => c.id === id ? { ...c, estado: 'confirmada' } : c));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelCita = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/citas/${id}/cancelar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({})
      });
      if (!res.ok) throw new Error('No se pudo cancelar la cita');
      // update local state
      setCitas(prev => prev.map(c => c.id === id ? { ...c, estado: 'cancelada' } : c));
      setUserCitas(prev => prev.map(c => c.id === id ? { ...c, estado: 'cancelada' } : c));
    } catch (err) {
      alert(err.message);
    }
  };

  const getFilenameFromContentDisposition = (cd) => {
    if (!cd) return null;
    const match = /filename\*=UTF-8''([^;\n]+)/i.exec(cd) || /filename="?([^";\n]+)"?/i.exec(cd);
    return match ? decodeURIComponent(match[1]) : null;
  };

  const handleDownloadDocumento = async (idCita) => {
    try {
      setDownloadingId(idCita);
      setError('');
      const token = localStorage.getItem('token');
      const listRes = await fetch(`http://localhost:3000/api/documentos/cita/${idCita}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!listRes.ok) throw new Error('No se pudieron obtener los documentos de la cita');
      const listData = await listRes.json();
      const archivos = listData.archivos || [];
      if (archivos.length === 0) throw new Error('No hay documentos asociados a esta cita');
      archivos.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en));
      const doc = archivos[0];
      const dlRes = await fetch(`http://localhost:3000/api/documentos/download/${doc.id}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!dlRes.ok) {
        const errBody = await dlRes.json().catch(() => ({}));
        throw new Error(errBody.error || 'Error descargando el documento');
      }
      const blob = await dlRes.blob();
      const cd = dlRes.headers.get('Content-Disposition');
      let filename = getFilenameFromContentDisposition(cd) || doc.nombre || `documento_${doc.id}`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Error descargando documento');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent p-8 pt-20 backdrop-blur-md text-white">
      <div className="flex md:items-center flex-col md:flex-row gap-5 md:gap-2 justify-between">
        <div className="flex flex-col gap-2 items-start text-white">
          <h3 className="text-lg font-semibold">Panel de Citas (Staff)</h3>
          <p className="font-medium text-gray-300">Lista de todas las citas registradas en el sistema.</p>
        </div>

        <div className="mt-4 md:mt-0">
          <Button variant="outline" className="bg-transparent text-white border-gray-600 hover:bg-gray-700" onClick={() => navigate('/staff/citas')}>Actualizar</Button>
        </div>
      </div>

      <div className="mt-8 max-w-4xl mx-auto">
        {/* search & filter form */}
        <form className="flex flex-wrap items-center gap-2 mb-4" onSubmit={handleBuscarCitasUsuario}>
          <input
            type="number"
            min="1"
            value={userCitasId}
            onChange={e => setUserCitasId(e.target.value)}
            placeholder="Buscar por ID de usuario"
            className="border rounded px-3 py-2 text-sm focus:ring focus:ring-blue-200 w-64"
          />
          <Button type="submit" className="px-4 py-2" disabled={userCitasLoading || !userCitasId}>{userCitasLoading ? 'Buscando...' : 'Buscar'}</Button>

          <label className="text-sm text-gray-300 ml-4">Desde:</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded px-2 py-1 text-sm" />
          <label className="text-sm text-gray-300">Hasta:</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded px-2 py-1 text-sm" />
          <Button type="button" className="px-3 py-1" onClick={() => { setStartDate(''); setEndDate(''); }}>Limpiar filtros</Button>

          {userCitasError && <span className="w-full sm:w-auto text-red-600 text-xs ml-2">{userCitasError}</span>}
        </form>

        {/* user search results */}
        {userCitas && userCitas.length > 0 && (
          <div className="mb-6">
            <h4 className="font-bold text-blue-200 mb-2">Citas del usuario</h4>
            <ul className="divide-y divide-gray-700">
              {applyDateFilter(userCitas).map(cita => (
                <li key={cita.id} className="flex justify-between items-center py-4 px-4 hover:bg-gray-900/40 rounded-lg">
                  <div>
                    <h4 className="font-semibold">{cita.motivo}</h4>
                    <div className="text-xs text-gray-400">ID: {cita.id} • Usuario: {cita.id_usuario}</div>
                    <div className="text-sm text-gray-400">{cita.fecha ? `${cita.fecha.slice(0,10)}${cita.hora_12h ? ' ' + cita.hora_12h : ''}` : ''}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {cita.documento === true && (
                      <Button variant="outline" size="sm" onClick={() => handleDownloadDocumento(cita.id)} disabled={downloadingId === cita.id} className="text-blue-400 border-blue-400">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </Button>
                    )}
                    {cita.estado !== 'confirmada' && (
                      <Button size="sm" className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleConfirmCita(cita.id)}>Confirmar</Button>
                    )}
                    {cita.estado !== 'cancelada' && (
                      <Button size="sm" className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white" onClick={() => handleCancelCita(cita.id)}>Cancelar</Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteCita(cita.id)} disabled={deleting} className="bg-red-600 hover:bg-red-700">
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {loading && <p className="text-gray-400">Cargando citas...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <ul role="list" className="divide-y divide-gray-700">
            {citas.length === 0 && (
              <li className="py-4 text-gray-400 text-center">No hay citas registradas</li>
            )}

            {applyDateFilter(citas).map((cita) => (
              <li key={cita.id} className="flex justify-between items-center py-5 px-4 hover:bg-gray-900/40 rounded-lg transition">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold">{cita.motivo}</h3>
                  <div className="text-xs text-gray-500">ID: {cita.id} • Usuario: {cita.id_usuario}</div>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-400">
                    <span>📅 {cita.fecha ? `${cita.fecha.slice(0,10)}${cita.hora_12h ? ' ' + cita.hora_12h : ''}` : ''}</span>
                    <span>• Estado: {cita.estado}</span>
                    <span>• Asignado a: {cita.id_staff || '-'}</span>
                    <span>• Documento: {cita.documento === true ? 'Sí' : 'No'}</span>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  {cita.documento === true && (
                    <Button variant="outline" size="sm" className="text-blue-400 border-blue-400 hover:bg-blue-900/40 flex items-center gap-1" onClick={() => handleDownloadDocumento(cita.id)} disabled={downloadingId === cita.id}>
                      {downloadingId === cita.id ? 'Descargando...' : <ArrowDownTrayIcon className="h-4 w-4" />}
                    </Button>
                  )}
                  {cita.estado !== 'confirmada' && (
                    <Button size="sm" className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleConfirmCita(cita.id)}>Confirmar</Button>
                  )}
                  {cita.estado !== 'cancelada' && (
                    <Button size="sm" className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white" onClick={() => handleCancelCita(cita.id)}>Cancelar</Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteCita(cita.id)} disabled={deleting} className="bg-red-600 hover:bg-red-700">
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}