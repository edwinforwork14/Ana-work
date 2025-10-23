import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import useNotifications from "@/hooks/useNotifications";

export default function NotificationsPage() {
  // Disable automatic polling in this full-page view; user can refresh manualmente
  const { notifs, loading, error, fetchNotifs, markAsRead } = useNotifications({ pollInterval: 0 });
  const navigate = useNavigate();
  
  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return {};
    }
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const role = token ? (parseJwt(token).rol || '') : '';

  return (
    <section className="p-6 text-gray-300">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Notificaciones</h1>
        <div>
          <Button onClick={fetchNotifs} className="bg-green-600">Refrescar</Button>
        </div>
      </div>

      {loading && <p className="text-gray-400">Cargando...</p>}
      {error && <p className="text-red-400">{error}</p>}

      <div className="bg-gray-800/40 rounded-lg p-4">
        {notifs.length === 0 && !loading ? (
          <p className="text-gray-400">No hay notificaciones.</p>
        ) : (
          <ul className="space-y-4">
            {notifs.map((n) => (
              <li key={n.id} className={`flex items-start gap-4 p-3 rounded-md ${n.leida ? 'bg-gray-900/30' : 'bg-gray-700/50'}`}>
                <Avatar className="h-10 w-10 rounded-full bg-gray-50 flex-none">
                  {n.from === 'cliente' ? (
                    <AvatarFallback>{(n.mensaje || 'N').slice(0,2).toUpperCase()}</AvatarFallback>
                  ) : (
                    <AvatarFallback>ST</AvatarFallback>
                  )}
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{n.mensaje}</p>
                      <p className="text-xs text-gray-400">{n.creada_en ? new Date(n.creada_en).toLocaleString() : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!n.leida && (
                        <Button onClick={() => markAsRead(n.id)} className="bg-green-600 text-sm">Marcar leída</Button>
                      )}
                      {n.id_cita && (
                        <Button
                          onClick={() => {
                            if (role === 'staff') navigate('/staff/citas');
                            else navigate('/cliente/mis-citas');
                          }}
                          className="bg-transparent border border-gray-600 text-sm"
                        >
                          Ver cita
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
