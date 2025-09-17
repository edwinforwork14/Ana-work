import { useLocation, Navigate } from 'react-router-dom';

export default function PrivateRoute({ children, allowedRoles, user }) {
  const location = useLocation();

  if (!user || !user.rol) {
    // No autenticado
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.rol)) {
    // No autorizado
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded shadow text-center">
          <h2 className="font-bold text-lg mb-2">Acceso denegado</h2>
          <p>No tienes permiso para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return children;
}
