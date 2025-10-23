import { useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

const fetchNotificaciones = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:3000/api/notificaciones', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('No se pudieron obtener notificaciones');
  const data = await res.json();
  return Array.isArray(data) ? data : data.notificaciones || [];
};

export default function useNotifications({ pollInterval = 20000 } = {}) {
  const queryClient = useQueryClient();

  const { data: notifs = [], isLoading: loading, error } = useQuery({
    queryKey: ['notificaciones'],
    queryFn: fetchNotificaciones,
    refetchInterval: pollInterval > 0 ? pollInterval : false,
    staleTime: 1000 * 5, // short stale time
    cacheTime: 1000 * 60 * 5,
  });

  const markMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/notificaciones/${id}/leida`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No se pudo marcar como leída');
      return true;
    },
    onSuccess: () => {
      // invalidate so queries refetch and share updated state
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    }
  });

  const fetchNotifs = useCallback(() => queryClient.invalidateQueries(['notificaciones']), [queryClient]);

  const markAsRead = useCallback(async (id) => {
    try {
      await markMutation.mutateAsync(id);
      return true;
    } catch (e) {
      return false;
    }
  }, [markMutation]);

  return { notifs, loading, error, fetchNotifs, markAsRead };
}
