import { useLocation, Navigate } from 'react-router-dom';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function PrivateRoute({ children, allowedRoles, user }) {
  const location = useLocation();

  // If user not provided via props, try to read from localStorage token
  let currentUser = user;
  if (!currentUser) {
    const token = localStorage.getItem('token');
    if (token) currentUser = parseJwt(token);
  }

  if (!currentUser || !currentUser.rol) {
    // Not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(currentUser.rol)) {
    // Not authorized
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
