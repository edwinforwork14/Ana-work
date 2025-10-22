import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function StaffAvailabilityTable({ idStaff, fecha, desde, hasta, useAuthRoute = false, refreshKey = 0 }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ocupadoDates, setOcupadoDates] = useState([]);

  useEffect(() => {
    if (!idStaff || !fecha) {
      setRows([]);
      return;
    }

    const fetchDisponibilidad = async () => {
      setLoading(true);
      setError(null);

      try {
        // Si el caller pasó desde/hasta explícitos, úsalos. Si no, derive hasta = fecha + 1 día
        let desdeParam = desde;
        let hastaParam = hasta;
        if (!desdeParam || !hastaParam) {
          if (!fecha) {
            // nothing to do
            desdeParam = undefined;
            hastaParam = undefined;
          } else {
            desdeParam = fecha;
            const d = new Date(fecha);
            const next = new Date(d);
            next.setDate(d.getDate() + 1);
            const yyyy = next.getFullYear();
            const mm = String(next.getMonth() + 1).padStart(2, '0');
            const dd = String(next.getDate()).padStart(2, '0');
            hastaParam = `${yyyy}-${mm}-${dd}`;
          }
        }

        const token = localStorage.getItem('token');

        // Construir la URL con template string (localhost:3000)
        const fetchUrl = `http://localhost:3000/api/staff/disponibilidad?id_staff=${idStaff}&desde=${desdeParam || ''}&hasta=${hastaParam || ''}`;
        console.log('[StaffAvailabilityTable] Fetching disponibilidad from:', fetchUrl);

        const res = await fetch(fetchUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const text = await res.text();
        console.log('[StaffAvailabilityTable] Raw response text:', text);
        let data;
        try {
          data = JSON.parse(text);
          console.log('[StaffAvailabilityTable] Parsed JSON:', data);
        } catch (err) {
          console.error('[StaffAvailabilityTable] JSON parse error:', err);
          console.error('[StaffAvailabilityTable] Response text:', text);
          throw new Error('El servidor no devolvió JSON válido. Revisa la consola para ver la respuesta cruda.');
        }

        const bloques = data.disponibilidad || data.bloques || data;
        const normalized = (bloques || []).map((b, idx) => {
          const start = new Date(b.start || b.fecha || b.startDate || b.start_time);
          const end = new Date(b.end || b.end_time || b.endDate);
          return {
            id: idx,
            start,
            end,
            ocupado: !!b.ocupado,
          };
        });

        setRows(normalized);
        // Calcular fechas únicas ocupadas (formato local corto)
        const ocupadoSet = new Set();
        normalized.forEach(n => {
          if (n.ocupado) {
            const d = n.start;
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yyyy = d.getFullYear();
            ocupadoSet.add(`${dd}/${mm}/${yyyy}`);
          }
        });
        setOcupadoDates(Array.from(ocupadoSet));

      } catch (err) {
        setError(err.message || 'Error al cargar disponibilidad');
      } finally {
        setLoading(false);
      }
    };

    fetchDisponibilidad();
  }, [idStaff, fecha, refreshKey, useAuthRoute]);

  return (
    <div className="w-full">
      <h3 className="text-white mb-2 text-lg">Disponibilidad</h3>
      <div className="rounded-lg border border-gray-700 bg-gray-900/60 p-3 max-h-96 overflow-y-auto">
        {loading && <div className="text-gray-400 p-4">Cargando disponibilidad...</div>}
        {error && <div className="text-red-400 p-4">{error}</div>}
        {!loading && !error && rows.length === 0 && (
          <div className="text-gray-400 p-4">No hay bloques para esta fecha</div>
        )}
        {/* Mostrar fechas ocupadas en la parte superior */}
        {!loading && !error && ocupadoDates.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {ocupadoDates.map(d => (
              <span key={d} className="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded">
                {d}
              </span>
            ))}
          </div>
        )}
        {!loading && !error && rows.length > 0 && (
          <ul className="divide-y divide-gray-700">
            {rows.map((r) => (
              <li key={r.id} className="flex justify-between items-center py-3">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {r.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {r.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-xs text-gray-400">{r.start.toLocaleDateString()}</div>
                </div>
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${r.ocupado ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                    {r.ocupado ? 'Ocupado' : 'Libre'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

StaffAvailabilityTable.propTypes = {
  idStaff: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fecha: PropTypes.string,
  desde: PropTypes.string,
  hasta: PropTypes.string,
  useAuthRoute: PropTypes.bool,
  refreshKey: PropTypes.number,
};
