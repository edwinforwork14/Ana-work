
import { Link, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import DashboardCliente from './pages/DashboardCliente';
import DashboardStaff from './pages/DashboardStaff';
import DashboardAdmin from './pages/DashboardAdmin';
import { BackendData } from './components/BackendData';
import { useState } from 'react';


export default function App() {
  const [dbError, setDbError] = useState(null);
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="w-full bg-white shadow flex justify-between items-center px-8 py-4 relative">
        <h1 className="text-2xl font-bold text-green-600">Bienvenido</h1>
        <div className="flex-1 flex justify-center">
          <Link to="/" className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-semibold hover:bg-gray-300 transition">Inicio</Link>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Iniciar sesión</Link>
          <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Registrarse</Link>
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard-cliente" element={<DashboardCliente />} />
          <Route path="/dashboard-staff" element={<DashboardStaff />} />
          <Route path="/dashboard-admin" element={<DashboardAdmin />} />
        </Routes>
      </main>
    </div>
  );
}
