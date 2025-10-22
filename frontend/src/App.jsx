import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import DashboardCliente from './pages/DashboardCliente';
import DashboardStaff from './pages/DashboardStaff';
import DashboardAdmin from './pages/DashboardAdmin';
import MyCitas from './pages/clientePanel/myCitas';
import CreateCita from './pages/clientePanel/createCita';
import UploadDocument from './pages/clientePanel/uploadDocument';
import VerMisDocumentos from './pages/clientePanel/verMisDocumentos';
import Notifications from './pages/notifications';
import StaffCitas from './pages/staffPanel/citas';
import AdminCitas from './pages/adminPanel/citas';
import PrivateRoute from './components/PrivateRoute';
import WithBackground from './components/WithBackground';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
}

function getTokenExpiration(token) {
  const payload = parseJwt(token);
  return payload.exp ? payload.exp * 1000 : null;
}

function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) return false;
  const exp = getTokenExpiration(token);
  if (!exp) return false;
  return Date.now() < exp;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState({ id: '', nombre: '', rol: '' });
  const navigate = useNavigate();

  useEffect(() => {
    setIsAuthenticated(checkAuth());
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      setUserInfo({
        id: payload.id || payload.user_id || '',
        nombre: (payload.persona && payload.persona.nombre) || payload.nombre || payload.name || payload.username || '',
        rol: payload.rol || ''
      });
    }
  }, []);

  useEffect(() => {
    // previously this effect forced navigation to '/', which can cause
    // unexpected route changes on mount. Removing it so the router preserves
    // the current URL (use browser nav or explicit redirects where needed).
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      setUserInfo({
        id: payload.id || payload.user_id || '',
        nombre: (payload.persona && payload.persona.nombre) || payload.nombre || payload.name || payload.username || '',
        rol: payload.rol || ''
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <Routes>
      <Route path="/" element={<WithBackground isAuthenticated={isAuthenticated} userInfo={userInfo} onLogout={handleLogout}><Home /></WithBackground>} />
      <Route path="/login" element={<WithBackground isAuthenticated={isAuthenticated} userInfo={userInfo} onLogout={handleLogout}><Login onLoginSuccess={handleLoginSuccess} /></WithBackground>} />
      <Route path="/register" element={<WithBackground isAuthenticated={isAuthenticated} userInfo={userInfo} onLogout={handleLogout}><Register /></WithBackground>} />

      <Route path="/cliente" element={<WithBackground isAuthenticated={isAuthenticated} userInfo={userInfo} onLogout={handleLogout}><PrivateRoute><DashboardCliente /></PrivateRoute></WithBackground>} />
      <Route path="/staff" element={<WithBackground isAuthenticated={isAuthenticated} userInfo={userInfo} onLogout={handleLogout}><PrivateRoute><DashboardStaff /></PrivateRoute></WithBackground>} />
      <Route path="/admin" element={<WithBackground isAuthenticated={isAuthenticated} userInfo={userInfo} onLogout={handleLogout}><PrivateRoute><DashboardAdmin /></PrivateRoute></WithBackground>} />

      <Route path="/cliente/mis-citas" element={<WithBackground isAuthenticated={isAuthenticated} userInfo={userInfo} onLogout={handleLogout}><PrivateRoute><MyCitas /></PrivateRoute></WithBackground>} />
  <Route path="/cliente/crear-cita" element={<WithBackground isAuthenticated={isAuthenticated} userInfo={userInfo} onLogout={handleLogout}><PrivateRoute><CreateCita /></PrivateRoute></WithBackground>} />
  {/* Alias route used by navigation buttons: keep for backward compatibility */}
  <Route path="/cliente/agendar-cita" element={<WithBackground isAuthenticated={isAuthenticated} userInfo={userInfo} onLogout={handleLogout}><PrivateRoute><CreateCita /></PrivateRoute></WithBackground>} />
      <Route path="/cliente/subir-documento" element={<WithBackground isAuthenticated={isAuthenticated} userInfo={userInfo} onLogout={handleLogout}><PrivateRoute><UploadDocument /></PrivateRoute></WithBackground>} />
      <Route path="/cliente/mis-documentos" element={<WithBackground isAuthenticated={isAuthenticated} userInfo={userInfo} onLogout={handleLogout}><PrivateRoute><VerMisDocumentos /></PrivateRoute></WithBackground>} />

      <Route path="/staff/citas" element={<WithBackground isAuthenticated={isAuthenticated} userInfo={userInfo} onLogout={handleLogout}><PrivateRoute><StaffCitas /></PrivateRoute></WithBackground>} />
      <Route path="/admin/citas" element={<WithBackground isAuthenticated={isAuthenticated} userInfo={userInfo} onLogout={handleLogout}><PrivateRoute><AdminCitas /></PrivateRoute></WithBackground>} />
  <Route path="/notifications" element={<WithBackground isAuthenticated={isAuthenticated} userInfo={userInfo} onLogout={handleLogout}><PrivateRoute><Notifications /></PrivateRoute></WithBackground>} />
  {/* Spanish alias */}
  <Route path="/notificaciones" element={<WithBackground isAuthenticated={isAuthenticated} userInfo={userInfo} onLogout={handleLogout}><PrivateRoute><Notifications /></PrivateRoute></WithBackground>} />

      <Route path="*" element={<WithBackground isAuthenticated={isAuthenticated} userInfo={userInfo} onLogout={handleLogout}><Home /></WithBackground>} />
    </Routes>
  );
}
