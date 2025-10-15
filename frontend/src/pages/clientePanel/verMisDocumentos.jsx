import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';


const VerMisDocumentos = () => {
  // useParams() may return an empty object (or undefined in some contexts),
  // avoid destructuring directly to prevent "Cannot read properties of undefined"
  const params = useParams();
  const paramId = params?.id_cita;
  const location = useLocation();
  const search = location?.search || '';
  const id_cita = paramId || new URLSearchParams(search).get('id_cita');
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      setError("");
      if (!id_cita) {
        setError('Falta id_cita en la ruta o query string');
        setDocumentos([]);
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/documentos/cita/${id_cita}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("No se pudieron obtener los documentos");
  const data = await res.json();
  setDocumentos(Array.isArray(data.archivos) ? data.archivos : []);
      } catch (err) {
        setError(err.message || "Error al cargar documentos");
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [id_cita]);

  const handleDownload = (id_documento, nombre) => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:3000/api/documentos/download/${id_documento}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al descargar');
        // intentar extraer filename desde Content-Disposition
        const disposition = res.headers.get('content-disposition');
        let filename = nombre || 'documento';
        if (disposition) {
          const match = disposition.match(/filename\*=UTF-8''([^;\n\r]+)/i);
          if (match && match[1]) {
            try {
              filename = decodeURIComponent(match[1]);
            } catch (e) {
              filename = match[1];
            }
          } else {
            const match2 = disposition.match(/filename="?([^";]+)"?/i);
            if (match2 && match2[1]) filename = match2[1];
          }
        }
        return res.blob().then(blob => ({ blob, filename }));
      })
      .then(({ blob, filename }) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || (nombre || 'documento');
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => alert('No se pudo descargar el archivo.'));
  };

  const handleDelete = async (id_documento) => {
    if (!window.confirm('¿Seguro que deseas eliminar este documento?')) return;
    setDeletingId(id_documento);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/documentos/eliminar', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id_documento })
      });
      if (!res.ok) throw new Error('No se pudo eliminar');
      setDocumentos(documentos.filter(d => d.id !== id_documento));
    } catch (err) {
      alert(err.message || 'Error al eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Documentos de la cita</h2>
      {loading ? (
        <p>Cargando documentos...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          {documentos.length === 0 ? (
            <p>No hay documentos para esta cita.</p>
          ) : (
            <table className="min-w-full bg-white border rounded shadow">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Nombre</th>
                  <th className="px-4 py-2 border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documentos.map(doc => (
                  <tr key={doc.id}>
                    <td className="px-4 py-2 border">{doc.nombre}</td>
                    <td className="px-4 py-2 border flex gap-2">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        onClick={() => handleDownload(doc.id, doc.nombre)}
                      >
                        Descargar
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                      >
                        {deletingId === doc.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default VerMisDocumentos;
