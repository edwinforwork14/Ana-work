import { useState, useEffect } from 'react';

/**
 * Componente hook para obtener datos del backend usando CORS.
 * @param {string} endpoint - Endpoint del backend (ejemplo: '/api/citas')
 * @param {object} options - Opciones para fetch (headers, method, body, etc)
 * @returns {object} { data, loading, error }
 */
export function useBackend(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`http://localhost:3000${endpoint}`, {
      credentials: 'include',
      ...options,
    })
      .then(res => {
        if (!res.ok) throw new Error('Error: ' + res.status);
        return res.json();
      })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [endpoint, JSON.stringify(options)]);

  return { data, loading, error };
}

/**
 * Ejemplo de componente que usa el hook para mostrar datos
 */
export function BackendData({ endpoint, options, onError }) {
  const { data, loading, error } = useBackend(endpoint, options);
  if (loading) return <div>Cargando...</div>;
  if (error) {
    if (onError) onError(error);
    return null;
  }
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
