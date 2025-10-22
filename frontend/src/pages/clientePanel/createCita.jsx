import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/button";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import StaffAvailabilityTable from '@/components/StaffAvailabilityTable';

export default function AgendarCita() {
  const navigate = useNavigate();
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [motivo, setMotivo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [staffs, setStaffs] = useState([]);
  const [idStaff, setIdStaff] = useState("");
  const [duracion, setDuracion] = useState(60);
  const [refreshKey, setRefreshKey] = useState(0);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // Si se selecciona un staff y no hay fecha, usar la fecha de hoy por defecto
  useEffect(() => {
    if (idStaff && !fecha) {
      const d = new Date();
      setFecha(d.toISOString().slice(0, 10));
    }
  }, [idStaff]);

  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/auth/staffs");
        if (!res.ok) return;
        const data = await res.json();
        setStaffs(data.staffs || []);
      } catch (e) {
        // ignore
      }
    };
    fetchStaffs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccess(false);

    if (!idStaff) {
      setErrorMsg("Debes seleccionar un staff");
      return;
    }
    if (!fecha || !hora) {
      setErrorMsg("Debes seleccionar fecha y hora");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const [h, m] = hora.split(":");
      const localDate = new Date(Number(fecha.slice(0,4)), Number(fecha.slice(5,7)) - 1, Number(fecha.slice(8,10)), Number(h), Number(m), 0);
      const fechaHoraUTC = localDate.toISOString();

      const body = {
        fecha,
        hora,
        motivo,
        id_staff: Number(idStaff),
        duracion: Number(duracion),
        fecha_hora_utc: fechaHoraUTC
      };

      const res = await fetch("http://localhost:3000/api/citas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setMensaje(data.mensaje || "¡Cita agendada exitosamente!");
        setFecha("");
        setHora("");
        setMotivo("");
        setIdStaff("");
        setDuracion(60);
        setTimeout(() => navigate('/cliente/mis-citas'), 900);
      } else {
        setErrorMsg(data.error || data.message || "Error al agendar la cita.");
      }
    } catch (err) {
      setErrorMsg("Error de conexión con el servidor.");
    }
  };

  return (
    <section className="relative text-gray-300">
      <div className="container mx-auto px-5 py-24 backdrop-blur-sm">
        <div className="mb-12 flex w-full flex-col text-center">
          <h1 className="title-font mb-4 text-2xl font-semibold text-white sm:text-3xl">
            Agendar Cita
          </h1>
          <p className="mx-auto text-base leading-relaxed lg:w-2/3 text-gray-300">
            Selecciona la fecha, hora, motivo y el staff para tu cita. Nuestro equipo se pondrá en contacto contigo para confirmar la disponibilidad.
          </p>
        </div>

        <div className="mx-auto md:w-11/12 lg:w-4/5">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* FORMULARIO */}
            <div className="w-full lg:w-2/3">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Staff</label>
                    <select
                      value={idStaff}
                      onChange={(e) => setIdStaff(e.target.value)}
                      className="w-full rounded border border-gray-600 bg-gray-800/50 py-2 px-3 text-base text-gray-100 outline-none"
                      required
                    >
                      <option value="">Selecciona un staff</option>
                      {staffs.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre} (ID: {s.id})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="sr-only">Fecha</label>
                      <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="w-full rounded border border-gray-600 bg-gray-800/50 py-2 px-3 text-base text-gray-100 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-700 transition"
                        required
                      />
                    </div>
                    <div className="w-36">
                      <label className="sr-only">Hora</label>
                      <input
                        type="time"
                        value={hora}
                        onChange={(e) => setHora(e.target.value)}
                        className="w-full rounded border border-gray-600 bg-gray-800/50 py-2 px-3 text-base text-gray-100 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-700 transition"
                        required
                      />
                    </div>
                  </div>

                  {/* Desde/Hasta controls moved inside the form */}
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-sm text-gray-300 mr-2">Desde:</label>
                    <input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="rounded border border-gray-600 bg-gray-800/50 py-1 px-2 text-sm text-gray-100" />
                    <label className="text-sm text-gray-300 ml-2">Hasta:</label>
                    <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="rounded border border-gray-600 bg-gray-800/50 py-1 px-2 text-sm text-gray-100" />
                    <button type="button" onClick={() => { if (fecha) { setDesde(fecha); const d = new Date(fecha); d.setDate(d.getDate() + 1); setHasta(d.toISOString().slice(0,10)); } }} className="px-2 py-1 rounded bg-blue-600 text-white">Usar fecha</button>
                    <button type="button" onClick={() => setRefreshKey(k => k + 1)} className="px-2 py-1 rounded bg-green-600 text-white ml-auto">Actualizar disponibilidad</button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Duración (min)</label>
                    <input type="number" min="15" max="480" value={duracion} onChange={e => setDuracion(e.target.value)} className="w-36 rounded border border-gray-600 bg-gray-800/50 py-2 px-3 text-base text-gray-100 outline-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Motivo</label>
                    <textarea
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      required
                      className="h-32 w-full resize-none rounded border border-gray-600 bg-gray-800/50 py-2 px-3 text-base text-gray-100 placeholder-transparent outline-none focus:border-green-400 focus:ring-2 focus:ring-green-700 transition"
                    />
                  </div>

                  <div className="text-center">
                    <Button
                      type="submit"
                      className="mx-auto flex items-center gap-2 rounded bg-green-600 py-2 px-8 text-lg text-white hover:bg-green-700 focus:outline-none transition"
                    >
                      Agendar Cita
                      <ArrowRightIcon className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </form>

              {/* Mensajes */}
              <div className="mt-6 text-center">
                {success && <p className="text-green-400 font-semibold">{mensaje}</p>}
                {errorMsg && <p className="text-red-400 font-semibold">{errorMsg}</p>}
              </div>
            </div>

            {/* DISPONIBILIDAD DEL STAFF */}
            <div className="w-full lg:w-1/3">
              <div className="rounded-2xl bg-gray-800/60 border border-gray-700 shadow-xl p-6 backdrop-blur-md">
                <h2 className="text-xl font-semibold text-white mb-4">Disponibilidad del Staff</h2>

                {idStaff ? (
                  <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-700 bg-gray-900/40 p-2 custom-scroll">
                    <StaffAvailabilityTable idStaff={idStaff} fecha={fecha} desde={desde} hasta={hasta} useAuthRoute={true} refreshKey={refreshKey} />
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Selecciona un staff para ver su disponibilidad.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
