import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/button";
import { CloudArrowUpIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export default function UploadDocument() {
  const [file, setFile] = useState(null);
  const [idCita, setIdCita] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Ocultar mensajes después de 3 segundos
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(selected.type)) {
      setErrorMsg("Solo se permiten archivos PDF, imágenes o Word.");
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    setLoading(true);

    if (!file || !idCita) {
      setErrorMsg("Debes seleccionar un archivo y una cita.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("id_cita", idCita);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/documentos/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg("Documento subido correctamente.");
        setFile(null);
        setIdCita("");
      } else {
        setErrorMsg(data.error || "Error al subir documento.");
      }
    } catch (err) {
      setErrorMsg("Error de red.");
    }

    setLoading(false);
  };

  return (
    <section className="relative text-gray-300">
      <div className="container mx-auto px-5 py-24 backdrop-blur-sm">
        <div className="mb-12 flex w-full flex-col text-center">
          <h1 className="title-font mb-4 text-2xl font-semibold text-white sm:text-3xl">
            Subir Documento de Cita
          </h1>
          <p className="mx-auto text-base leading-relaxed lg:w-2/3 text-gray-300">
            Adjunta un documento relacionado con tu cita. Aceptamos archivos PDF, imágenes o documentos Word.
          </p>
        </div>

        <div className="mx-auto md:w-2/3 lg:w-1/2">
          <form onSubmit={handleSubmit}>
            <div className="-m-2 flex flex-wrap">

              {/* Campo ID Cita */}
              <div className="w-full p-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  ID de la Cita
                </label>
                <input
                  type="text"
                  value={idCita}
                  onChange={(e) => setIdCita(e.target.value)}
                  required
                  className="w-full rounded border border-gray-600 bg-gray-800/50 py-2 px-3 text-base text-gray-100 outline-none placeholder-transparent focus:border-green-400 focus:ring-2 focus:ring-green-700 transition"
                  placeholder="ID de la cita"
                />
              </div>

              {/* Campo Archivo */}
              <div className="w-full p-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Archivo
                </label>
                <div>
                  <label className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded cursor-pointer">
                    <CloudArrowUpIcon className="h-5 w-5" />
                    {file ? file.name : 'Seleccionar archivo'}
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    />
                  </label>
                </div>
              </div>

              {/* Botones */}
              <div className="w-full p-2 text-center">
                <div className="mx-auto flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 rounded bg-green-600 py-2 px-8 text-lg text-white hover:bg-green-700 focus:outline-none transition disabled:opacity-60"
                  >
                    {loading ? 'Subiendo...' : 'Subir Documento'}
                    <ArrowRightIcon className="h-5 w-5" />
                  </Button>

                  <button
                    type="button"
                    onClick={() => navigate('/cliente/mis-citas')}
                    className="flex rounded border border-green-600 bg-transparent py-2 px-6 text-lg text-green-400 hover:bg-green-700/10 focus:outline-none transition"
                  >
                    Ver mis citas
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Mensajes */}
          <div className="mt-6 text-center">
            {successMsg && (
              <p className="text-green-400 font-semibold">{successMsg}</p>
            )}
            {errorMsg && (
              <p className="text-red-400 font-semibold">{errorMsg}</p>
            )}
          </div>

          {/* Instrucciones */}
          <div className="mt-10 rounded-lg border border-gray-700 bg-gray-800/40 p-5 text-gray-300">
            <h3 className="text-lg font-semibold text-green-400 mb-2">Instrucciones</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Solo se permiten archivos PDF, imágenes o Word.</li>
              <li>El archivo se asociará a la cita indicada por el ID.</li>
              <li>Si tienes dudas, consulta con el staff.</li>
            </ul>
            <p className="mt-3 text-xs text-gray-400">
              <b>Nota:</b> El staff podrá revisar los documentos subidos y asociarlos a tu expediente.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
