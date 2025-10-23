import { useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

export type NotificationItem = {
  id: string | number;
  mensaje?: string;
  leida?: boolean;
  creada_en?: string;
  tipo?: string;
};

const fetchNotificaciones = async (): Promise<NotificationItem[]> => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:3000/api/notificaciones', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('No se pudieron obtener notificaciones');
  const data = await res.json();
  return Array.isArray(data) ? data : data.notificaciones || [];
};

export default function useNotifications({ pollInterval = 20000 }: { pollInterval?: number } = {}) {
  const queryClient = useQueryClient();

  const { data: notifs = [], isLoading: loading, error } = useQuery<NotificationItem[], Error>({
    queryKey: ['notificaciones'],
    queryFn: fetchNotificaciones,
    refetchInterval: pollInterval > 0 ? pollInterval : false,
    staleTime: 1000 * 5
  });

  const markMutation = useMutation<boolean, Error, string | number>({
    mutationFn: async (id: string | number) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/notificaciones/${id}/leida`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No se pudo marcar como leída');
      return true;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificaciones'] })
  });

  const fetchNotifs = useCallback(() => queryClient.invalidateQueries({ queryKey: ['notificaciones'] }), [queryClient]);

  const markAsRead = useCallback(async (id: string | number) => {
    try {
      await markMutation.mutateAsync(id);
      return true;
    } catch (e) {
      return false;
    }
  }, [markMutation]);

  return { notifs, loading, error, fetchNotifs, markAsRead };
}
