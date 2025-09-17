
import { Link, Routes, Route } from 'react-router-dom';


import Login from './pages/Login';
import Register from './pages/Register';
import DashboardCliente from './pages/DashboardCliente';
import DashboardStaff from './pages/DashboardStaff';
import DashboardAdmin from './pages/DashboardAdmin';
import { useState, useEffect } from 'react';

import MyCitas from './pages/clientePanel/myCitas';
import CreateCita from './pages/clientePanel/createCita';
import UploadDocument from './pages/clientePanel/uploadDocument';
import StaffCitas from './pages/staffPanel/citas';
import AdminCitas from './pages/adminPanel/citas';
import PrivateRoute from './components/PrivateRoute';


function App() {
  const [dbError, setDbError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState({ id: '', nombre: '', rol: '' });


  // Decodifica el token JWT para obtener la expiración y datos de usuario
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

  // Verifica si el token es válido y no ha expirado
  function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    const exp = getTokenExpiration(token);
    if (!exp) return false;
    return Date.now() < exp;
  }


  useEffect(() => {
    setIsAuthenticated(checkAuth());
    // Obtener info de usuario del token
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      setUserInfo({
        id: payload.id || payload.user_id || '',
        nombre: (payload.persona && payload.persona.nombre) || payload.nombre || payload.name || payload.username || '',
        rol: payload.rol || ''
      });
    } else {
      setUserInfo({ id: '', nombre: '', rol: '' });
    }
    // Opcional: refresca el estado cada minuto
    const interval = setInterval(() => {
      setIsAuthenticated(checkAuth());
      const token = localStorage.getItem('token');
      if (token) {
        const payload = parseJwt(token);
        setUserInfo({
          id: payload.id || payload.user_id || '',
          nombre: (payload.persona && payload.persona.nombre) || payload.nombre || payload.name || payload.username || '',
          rol: payload.rol || ''
        });
      } else {
        setUserInfo({ id: '', nombre: '', rol: '' });
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  // Callback para actualizar autenticación desde Login
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    // Actualizar userInfo inmediatamente tras login
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="w-full bg-white shadow flex justify-between items-center px-8 py-4 relative">
        <h1 className="text-2xl font-bold text-green-600">Bienvenido</h1>
        <div className="flex-1 flex justify-center">
          <Link to="/" className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-semibold hover:bg-gray-300 transition">Inicio</Link>
        </div>
        <div className="flex flex-col items-end gap-1">
          {!isAuthenticated ? (
            <div className="flex gap-4">
              <Link to="/login" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Iniciar sesión</Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Registrarse</Link>
            </div>
          ) : (
            <>
              <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">Cerrar sesión</button>
              {(userInfo.id || userInfo.nombre) && (
                <div className="mt-1 text-xs text-gray-600 text-right">
                  <div><span className="font-bold">ID:</span> {userInfo.id}</div>
                  <div><span className="font-bold">Nombre:</span> {userInfo.nombre}</div>
                  <div><span className="font-bold">Rol:</span> {userInfo.rol}</div>
                </div>
              )}
            </>
          )}
        </div>
        {dbError && (
          <div className="absolute" style={{ right: '2rem', bottom: '-2.5rem' }}>
            <div className="bg-red-600 text-white px-4 py-2 rounded shadow-lg text-sm animate-pulse">
              No se pudo conectar con la base de datos
            </div>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <Routes>
          <Route
            path="/"
            element={
              <div className="space-y-6">
                <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">Elige una sección</h2>
                <div className="flex flex-wrap gap-6 justify-center">
                  <Link to="/dashboard-cliente" className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition">Panel Cliente</Link>
                  <Link to="/dashboard-staff" className="bg-purple-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-600 transition">Panel Staff</Link>
                  <Link to="/dashboard-admin" className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-600 transition">Panel Admin</Link>
                </div>
                {/* Sección de datos del backend eliminada temporalmente */}
              </div>
            }
          />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard-cliente" element={<DashboardCliente />} />
          <Route path="/dashboard-staff" element={
            <PrivateRoute allowedRoles={['staff', 'admin']} user={userInfo}>
              <DashboardStaff />
            </PrivateRoute>
          } />
          <Route path="/dashboard-admin" element={
            <PrivateRoute allowedRoles={['admin']} user={userInfo}>
              <DashboardAdmin />
            </PrivateRoute>
          } />
          <Route path="/cliente/mis-citas" element={<MyCitas />} />
          <Route path="/cliente/agendar-cita" element={<CreateCita />} />
          <Route path="/cliente/subir-documento" element={<UploadDocument />} />
          <Route path="/staff/citas" element={
            <PrivateRoute allowedRoles={['staff', 'admin']} user={userInfo}>
              <StaffCitas />
            </PrivateRoute>
          } />
          <Route path="/admin/citas" element={
            <PrivateRoute allowedRoles={['admin']} user={userInfo}>
              <AdminCitas />
            </PrivateRoute>
          } />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-6 mt-8 flex items-center justify-center">
        <span className="text-gray-400 text-sm">&nbsp;</span>
      </footer>
    </div>
  );
}

export default App;
