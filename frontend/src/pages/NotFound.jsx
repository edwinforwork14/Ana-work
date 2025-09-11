// pages/NotFound.jsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h2 className="text-3xl font-bold text-red-600">404 - Página no encontrada</h2>
      <p className="text-gray-600 mt-4">La ruta que buscas no existe.</p>
      <Link
        to="/"
        className="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
