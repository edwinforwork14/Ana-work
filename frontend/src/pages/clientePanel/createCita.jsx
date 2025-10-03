
import { useState, useEffect } from "react";
import { parseISO, format } from "date-fns";

export default function CreateCita() {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [motivo, setMotivo] = useState("");
  const [staffs, setStaffs] = useState([]);
  const [staffId, setStaffId] = useState("");
  const [duracion, setDuracion] = useState(60);
  const [successMsg, setSuccessMsg] = useState("");
  const [waitMsg, setWaitMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [disponibilidad, setDisponibilidad] = useState([]);

  // Consultar disponibilidad del staff seleccionado
  useEffect(() => {
    if (staffId) {
      // Consultar solo los horarios ocupados usando la nueva ruta
      const url = `http://localhost:3000/api/staff/ocupados?id_staff=${staffId}`;
      const token = localStorage.getItem('token');
      fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setDisponibilidad(data.ocupados || []);
        })
        .catch(() => setDisponibilidad([]));
    } else {
      setDisponibilidad([]);
    }
  }, [staffId]);

  // Mostrar en consola la ruta de disponibilidad cada vez que cambia el staff seleccionado
  useEffect(() => {
    if (staffId) {
      console.log(`http://localhost:3000/api/staff/disponibilidad?id_staff=${staffId}`);
    }
  }, [staffId]);

  // Obtener lista de staffs
  useEffect(() => {
    const fetchStaffs = async () => {
      const res = await fetch("http://localhost:3000/api/auth/staffs"); // Debes crear este endpoint que devuelva los usuarios con rol 'staff'
      const data = await res.json();
      setStaffs(data.staffs || []);
    };
    fetchStaffs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setWaitMsg("");
    setErrorMsg("");
    if (!staffId) {
      setErrorMsg("Debes seleccionar un staff");
      return;
    }
    if (!fecha || !hora) {
      setErrorMsg("Debes seleccionar fecha y hora");
      return;
    }
  setIsBlocked(true);
  setTimeout(() => setIsBlocked(false), 10000); // 10 segundos

    const token = localStorage.getItem('token');
    // Convertir hora a formato 12h (ej: "03:30 PM") si no lo está
    let hora12 = hora;
    if (!/AM|PM/i.test(hora12) && hora12) {
      let [h, m] = hora12.split(":");
      h = parseInt(h);
      let period = h >= 12 ? "PM" : "AM";
      h = h % 12;
      if (h === 0) h = 12;
      hora12 = `${h.toString().padStart(2, "0")}:${m} ${period}`;
    }
    const body = {
      fecha: fecha, // solo la fecha (YYYY-MM-DD)
      hora: hora12,   // hora en formato 12h
      motivo,
      id_staff: Number(staffId),
      duracion: Number(duracion)
    };
    try {
      const response = await fetch('http://localhost:3000/api/citas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
    } catch (error) {
      setErrorMsg("Error de red");
    }
  };

  // Ocultar los mensajes después de 3 segundos
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg("") , 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);
  useEffect(() => {
    if (waitMsg) {
      const timer = setTimeout(() => setWaitMsg("") , 3000);
      return () => clearTimeout(timer);
    }
  }, [waitMsg]);
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg("") , 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  return (
    <div className="flex flex-row gap-8 justify-center">
      {/* Formulario */}
      <div className="p-8 max-w-3xl w-[40vw] min-w-[340px] bg-white rounded-xl shadow relative">
        <h2 className="text-xl font-bold text-green-600 mb-4">Agendar Cita</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ...existing code... */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Staff</label>
            <select
              value={staffId}
              onChange={e => setStaffId(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-400"
              required
            >
              <option value="">Selecciona un staff</option>
              {staffs.map(staff => (
                <option key={staff.id} value={staff.id}>
                  {staff.nombre} (ID: {staff.id})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-400"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Hora</label>
            <input
              type="time"
              placeholder="Ej: 03:30 PM"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-400"
              required
            />
            <span className="text-xs text-gray-500">Formato: hh:mm AM/PM</span>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Motivo</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo de la cita"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-400 min-h-[80px] resize-vertical"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Duración (minutos)</label>
            <input
              type="number"
              min="15"
              max="180"
              value={duracion}
              onChange={e => setDuracion(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-400"
              required
            />
          </div>
          {waitMsg && (
            <div className="mb-2 text-yellow-600 font-semibold text-center">{waitMsg}</div>
          )}
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition w-full font-bold"
            disabled={isBlocked}
          >
            Enviar
          </button>
        </form>
        {/* Mostrar disponibilidad del staff seleccionado en texto */}
        {staffId && (
          <div className="mb-4 p-4 bg-gray-100 border border-gray-300 rounded text-sm">
            <span className="font-semibold text-gray-700">Horarios ocupados del staff seleccionado:</span>
            <ul className="list-disc ml-4 mt-1">
              {disponibilidad.length === 0 && <li className="text-green-600">No hay horarios ocupados</li>}
              {disponibilidad.map((oc, idx) => {
                const inicio = format(parseISO(oc.fecha), "yyyy-MM-dd HH:mm");
                let fin = oc.end_time ? format(parseISO(oc.end_time), "yyyy-MM-dd HH:mm") : "";
                return (
                  <li key={idx}>{inicio}{fin ? ` - ${fin}` : ""}</li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      {/* Bloque de horarios permitidos */}
      <div className="p-8 w-[320px] min-w-[220px] bg-blue-50 border border-blue-200 rounded-xl shadow h-fit self-start">
        <h3 className="text-lg font-bold text-blue-700 mb-2">Horarios permitidos</h3>
        <ul className="list-disc ml-4 text-blue-900 text-sm">
          <li>Lunes a viernes: <b>7:00</b> a <b>18:00</b></li>
          <li>Sábados: <b>7:00</b> a <b>14:00</b></li>
          <li className="text-red-600">Domingos: <b>No disponible</b></li>
        </ul>
        <div className="mt-4 text-xs text-blue-700">
          <b>Nota:</b> Si seleccionas un horario fuera de estos rangos, el sistema mostrará un error y no permitirá agendar la cita.
        </div>
      </div>
      {/* Mensajes flotantes */}
      {successMsg && (
        <div className="fixed z-50" style={{ right: '2rem', bottom: '2rem' }}>
          <div className="bg-green-600 text-white px-4 py-2 rounded shadow-lg text-sm animate-pulse">
            {successMsg}
          </div>
        </div>
      )}
      {waitMsg && (
        <div className="fixed z-50" style={{ right: '2rem', bottom: '2rem' }}>
          <div className="bg-yellow-500 text-white px-4 py-2 rounded shadow-lg text-sm animate-pulse">
            {waitMsg}
          </div>
        </div>
      )}
      {errorMsg && (
        <div className="fixed z-50" style={{ right: '2rem', bottom: '2rem' }}>
          <div className="bg-red-600 text-white px-4 py-2 rounded shadow-lg text-sm animate-pulse">
            {errorMsg}
          </div>
        </div>
      )}
    </div>
  );
}