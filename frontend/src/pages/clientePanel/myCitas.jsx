import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrashIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export default function MyCitas() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchCitas = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/citas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("No se pudieron obtener las citas");
        const data = await res.json();
        setCitas(data);
      } catch (err) {
        setError(err.message || "Error al cargar citas");
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, []);

  const handleDeleteCita = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta cita?")) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/citas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudo eliminar la cita");
      setCitas((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message || "Error al eliminar cita");
    } finally {
      setDeleting(false);
    }
  };

  const getFilenameFromContentDisposition = (cd) => {
    if (!cd) return null;
    const match =
      /filename\*=UTF-8''([^;\n]+)/i.exec(cd) ||
      /filename="?([^";\n]+)"?/i.exec(cd);
    return match ? decodeURIComponent(match[1]) : null;
  };

  const handleDownloadDocumento = async (idCita) => {
    try {
      setDownloadingId(idCita);
      setError("");
      const token = localStorage.getItem("token");

      const listRes = await fetch(
        `http://localhost:3000/api/documentos/cita/${idCita}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!listRes.ok)
        throw new Error("No se pudieron obtener los documentos de la cita");
      const listData = await listRes.json();
      const archivos = listData.archivos || [];
      if (archivos.length === 0) {
        throw new Error("No hay documentos asociados a esta cita");
      }

      archivos.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en));
      const doc = archivos[0];

      const dlRes = await fetch(
        `http://localhost:3000/api/documentos/download/${doc.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!dlRes.ok) {
        const errBody = await dlRes.json().catch(() => ({}));
        throw new Error(errBody.error || "Error descargando el documento");
      }

      const blob = await dlRes.blob();
      const cd = dlRes.headers.get("Content-Disposition");
      let filename =
        getFilenameFromContentDisposition(cd) ||
        doc.nombre ||
        `documento_${doc.id}`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Error descargando documento");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent p-8 pt-20 backdrop-blur-md text-white">
      <div className="flex md:items-center flex-col md:flex-row gap-5 md:gap-2 justify-between">
        <div className="flex flex-col gap-2 items-start text-white">
          <h3 className="text-lg font-semibold">Mis Citas</h3>
          <p className="font-medium text-gray-300">
            Lista de todas tus citas registradas en el sistema.
          </p>
        </div>

        <div className="mt-4 md:mt-0">
          <Button
            variant="outline"
            className="bg-transparent text-white border-gray-600 hover:bg-gray-700"
            onClick={() => navigate("/cliente/agendar-cita")}
          >
            + Nueva Cita
          </Button>
        </div>
      </div>

      <div className="mt-8">
        {loading && <p className="text-gray-400">Cargando citas...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <ul role="list" className="divide-y divide-gray-700">
            {citas.length === 0 && (
              <li className="py-4 text-gray-400 text-center">
                No hay citas agendadas.
              </li>
            )}

            {citas.map((cita) => (
              <li
                key={cita.id}
                className="flex justify-between items-center py-5 px-4 hover:bg-gray-900/40 rounded-lg transition"
              >
                {/* Contenido de la cita */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold">{cita.motivo}</h3>
                  <div className="text-xs text-gray-500">ID: {cita.id}</div>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-400">
                    <span>
                      📅 {cita.fecha
                        ? `${cita.fecha.slice(0, 10)}${
                            cita.hora_12h ? " " + cita.hora_12h : ""
                          }`
                        : ""}
                    </span>
                    <span>• Estado: {cita.estado}</span>
                    <span>• Asignado a: {cita.id_staff || "-"}</span>
                    <span>
                      • Recordatorio:{" "}
                      {cita.recordatorio_enviado ? "Enviado" : "No enviado"}
                    </span>
                    <span>
                      • Documento: {cita.documento === true ? "Sí" : "No"}
                    </span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 items-center">
                  {cita.documento === true && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-400 border-blue-400 hover:bg-blue-900/40 flex items-center gap-1"
                      onClick={() => handleDownloadDocumento(cita.id)}
                      disabled={downloadingId === cita.id}
                    >
                      {downloadingId === cita.id ? (
                        "Descargando..."
                      ) : (
                        <>
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteCita(cita.id)}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
