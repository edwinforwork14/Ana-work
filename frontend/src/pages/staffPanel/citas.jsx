import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function StaffCitas() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userCitasId, setUserCitasId] = useState('');
  const [userCitas, setUserCitas] = useState([]);
  const [userCitasLoading, setUserCitasLoading] = useState(false);
  const [userCitasError, setUserCitasError] = useState(null);

  // Obtener todas las citas
  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/citas', {
          headers: {
            'Content-Type': 'application/json',
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

  // Eliminar cita
  const handleDeleteCita = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta cita?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/citas/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) throw new Error('No se pudo eliminar la cita');
        setCitas(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Buscar citas por usuario
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
          'Content-Type': 'application/json',
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

  return (
    <div className="space-y-6 flex flex-col items-center">
      <h2 className="text-3xl font-bold text-purple-700">Panel de Citas (Staff)</h2>
      <div className="bg-white shadow rounded-lg p-4 w-full max-w-7xl">
        <h3 className="text-lg font-bold mb-2 text-purple-700">Todas las citas creadas</h3>

        {/* Barra de búsqueda por ID de usuario */}
        <form className="flex items-center gap-2 mb-4" onSubmit={handleBuscarCitasUsuario}>
          <input
            type="number"
            min="1"
            value={userCitasId}
            onChange={e => setUserCitasId(e.target.value)}
            placeholder="Buscar todas las citas por ID de usuario"
            className="border rounded px-3 py-2 text-sm focus:ring focus:ring-blue-200"
            style={{ width: 260 }}
          />
          <button
            type="submit"
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 text-sm"
            disabled={userCitasLoading || !userCitasId}
          >
            {userCitasLoading ? 'Buscando...' : 'Buscar'}
          </button>
          {userCitasError && <span className="text-red-600 text-xs ml-2">{userCitasError}</span>}
        </form>

        {/* Resultado de búsqueda de citas por usuario */}
        {userCitas && userCitas.length > 0 && (
          <div className="mb-4">
            <h4 className="font-bold text-blue-700 mb-1">Citas encontradas para el usuario:</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-3 py-2 text-left">ID Cita</th>
                    <th className="px-3 py-2 text-left">ID Usuario</th>
                    <th className="px-3 py-2 text-left">Fecha</th>
                    <th className="px-3 py-2 text-left">Motivo</th>
                    <th className="px-3 py-2 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {userCitas.map((cita) => (
                    <tr key={cita.id} className="border-b">
                      <td className="px-3 py-2">{cita.id}</td>
                      <td className="px-3 py-2">{cita.id_usuario}</td>
                      <td className="px-3 py-2">
                        {cita.fecha ? `${cita.fecha.slice(0,10)}${cita.hora_12h ? ' ' + cita.hora_12h : ''}` : ''}
                      </td>
                      <td className="px-3 py-2">{cita.motivo}</td>
                      <td className="px-3 py-2">{cita.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tabla principal de citas */}
        {loading ? (
          <div className="text-gray-500">Cargando...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-purple-100">
                  <th className="px-3 py-2 text-left">Eliminar</th>
                  <th className="px-3 py-2 text-left">ID Cita</th>
                  <th className="px-3 py-2 text-left">ID Usuario</th>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Motivo</th>
                  <th className="px-3 py-2 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(citas) && citas.length > 0 ? (
                  citas.map((cita) => (
                    <tr key={cita.id} className="border-b">
                      <td className="px-3 py-2">
                        <button
                          className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs"
                          title="Eliminar cita"
                          onClick={() => handleDeleteCita(cita.id)}
                        >
                          🗑️
                        </button>
                      </td>
                      <td className="px-3 py-2">{cita.id}</td>
                      <td className="px-3 py-2">{cita.id_usuario}</td>
                      <td className="px-3 py-2">
                        {cita.fecha ? `${cita.fecha.slice(0,10)}${cita.hora_12h ? ' ' + cita.hora_12h : ''}` : ''}
                      </td>
                      <td className="px-3 py-2">{cita.motivo}</td>
                      <td className="px-3 py-2">{cita.estado}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-4">No hay citas registradas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}