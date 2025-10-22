import * as React from 'react';
import './styles.css';
import useNotifications from '@/hooks/useNotifications';

// KendoReact dynamic integration with graceful fallback when packages are not installed
const App = () => {
  const { notifs, loading, fetchNotifs, markAsRead } = useNotifications();
  const [kendo, setKendo] = React.useState(null);

  // Try to dynamically import Kendo modules; if unavailable, keep null and render fallback
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const notifMod = await import('@progress/kendo-react-notification');
        const animMod = await import('@progress/kendo-react-animation');
        const btnMod = await import('@progress/kendo-react-buttons');
        if (!mounted) return;
        setKendo({
          Notification: notifMod.Notification,
          NotificationGroup: notifMod.NotificationGroup,
          Fade: animMod.Fade,
          KButton: btnMod.Button
        });
      } catch (e) {
        // Packages not installed or failed to load; we'll use fallback UI
        console.warn('Kendo packages not available, using fallback notifications UI');
        setKendo(null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => {
    // ensure the hook's polling is active by calling fetch once on mount
    fetchNotifs();
  }, [fetchNotifs]);

  // If Kendo is available, render Kendo toasts; otherwise render a simple fallback list
  if (kendo) {
    const { Notification, NotificationGroup, Fade, KButton } = kendo;
    return (
      <div>
        <NotificationGroup style={{ right: 0, bottom: 0, alignItems: 'flex-start', flexWrap: 'wrap-reverse' }}>
          <Fade>
            {notifs && notifs.filter(n => !n.leida).map(n => (
              <Notification
                key={n.id}
                type={{ style: n.tipo === 'error' ? 'error' : n.tipo === 'warning' ? 'warning' : 'info', icon: true }}
                closable={true}
                onClose={() => markAsRead(n.id)}
                style={{ maxWidth: 360 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', marginBottom: 6 }}>{n.mensaje}</strong>
                    <small style={{ color: '#999' }}>{n.creada_en ? new Date(n.creada_en).toLocaleString() : ''}</small>
                  </div>
                  <div style={{ marginLeft: 12 }}>
                    <KButton onClick={() => markAsRead(n.id)}>Marcar leída</KButton>
                  </div>
                </div>
              </Notification>
            ))}
          </Fade>
        </NotificationGroup>
      </div>
    );
  }

  // Fallback UI
  return (
    <div className="krn-fallback" style={{ position: 'fixed', right: 12, bottom: 12, width: 320, zIndex: 9999 }}>
      <div style={{ background: 'rgba(0,0,0,0.6)', color: 'white', padding: 12, borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <strong>Notificaciones</strong>
          <small style={{ opacity: 0.8 }}>{loading ? 'Cargando...' : ''}</small>
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {notifs.filter(n => !n.leida).length === 0 && <div style={{ color: '#ddd' }}>No hay notificaciones nuevas.</div>}
          {notifs.filter(n => !n.leida).map(n => (
            <div key={n.id} style={{ marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{n.mensaje}</div>
                  <div style={{ fontSize: 12, color: '#bbb' }}>{n.creada_en ? new Date(n.creada_en).toLocaleString() : ''}</div>
                </div>
                <div>
                  <button onClick={() => markAsRead(n.id)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 8px', borderRadius: 6 }}>Marcar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;