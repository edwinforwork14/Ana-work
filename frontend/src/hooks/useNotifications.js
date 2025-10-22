import { useState, useEffect, useCallback } from 'react';

export default function useNotifications({ pollInterval = 15000 } = {}) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/notificaciones', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No se pudieron obtener notificaciones');
      const data = await res.json();
      setNotifs(Array.isArray(data) ? data : data.notificaciones || []);
    } catch (e) {
      setError(e.message || 'Error al obtener notificaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/notificaciones/${id}/leida`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No se pudo marcar como leída');
      // refresh from server to ensure authoritative state
      await fetchNotifs();
      return true;
    } catch (e) {
      setError(e.message || 'Error marcando notificación');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchNotifs();
    const iv = setInterval(fetchNotifs, pollInterval);
    return () => clearInterval(iv);
  }, [fetchNotifs, pollInterval]);

  return { notifs, loading, error, fetchNotifs, markAsRead };
}
