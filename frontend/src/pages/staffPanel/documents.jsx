import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function StaffDocuments() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userIdFilter, setUserIdFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchCitas = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/citas', {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        if (!res.ok) throw new Error('Error al obtener citas');
        const data = await res.json();
        // Normalmente el backend devuelve array de citas; filtrar por aquellas que tienen documento flag
        const withDocs = (data || []).filter(c => c.documento === true || c.tiene_documento === true);
        setCitas(withDocs);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, []);

  const applyDateFilter = (items) => {
    if (!startDate && !endDate) return items;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return items.filter(i => {
      if (!i.fecha) return false;
      const f = new Date(i.fecha);
      if (start && f < start) return false;
      if (end) {
        const endOfDay = new Date(end);
        endOfDay.setHours(23,59,59,999);
        if (f > endOfDay) return false;
      }
      return true;
    });
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

  const filtered = applyDateFilter(citas).filter(c => (userIdFilter ? String(c.id_usuario) === String(userIdFilter) : true));

  return (
    <div className="min-h-screen w-full bg-transparent p-8 pt-20 backdrop-blur-md text-white">
      <div className="flex md:items-center flex-col md:flex-row gap-5 md:gap-2 justify-between">
        <div className="flex flex-col gap-2 items-start text-white">
          <h3 className="text-lg font-semibold">Documentos (Staff)</h3>
          <p className="font-medium text-gray-300">Lista de las citas que tienen documentos asociados. Filtra por usuario o fecha.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button variant="outline" className="bg-transparent text-white border-gray-600 hover:bg-gray-700" onClick={() => { setStartDate(''); setEndDate(''); setUserIdFilter(''); }}>Limpiar filtros</Button>
        </div>
      </div>

      <div className="mt-6 max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-2 items-center mb-4">
          <input type="number" placeholder="Filtrar por ID de usuario" value={userIdFilter} onChange={e => setUserIdFilter(e.target.value)} className="px-3 py-1 rounded border w-56" />
          <label className="text-sm text-gray-300">Desde:</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded px-2 py-1 text-sm" />
          <label className="text-sm text-gray-300">Hasta:</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded px-2 py-1 text-sm" />
        </div>

        {error && <div className="text-red-400 mb-3">{error}</div>}
        {loading && <div className="text-gray-400">Cargando...</div>}

        {!loading && filtered.length === 0 && <div className="text-gray-400">No se encontraron citas con documentos</div>}

        <ul className="divide-y divide-gray-700">
          {filtered.map(cita => (
            <li key={cita.id} className="flex justify-between items-center py-4 px-4 hover:bg-gray-900/40 rounded-lg">
              <div>
                <h4 className="font-semibold">{cita.motivo}</h4>
                <div className="text-xs text-gray-400">ID: {cita.id} • Usuario: {cita.id_usuario}</div>
                <div className="text-sm text-gray-400">{cita.fecha ? `${cita.fecha.slice(0,10)}${cita.hora_12h ? ' ' + cita.hora_12h : ''}` : ''}</div>
              </div>
              <div className="flex gap-2 items-center">
                <Button variant="outline" size="sm" onClick={() => handleDownloadDocumento(cita.id)} disabled={downloadingId === cita.id} className="text-blue-400 border-blue-400">
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
