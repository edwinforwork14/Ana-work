import { useState, useEffect } from "react";

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
    setTimeout(() => setIsBlocked(false), 120000); // 2 minutos

    const token = localStorage.getItem('token');
    const fechaCompleta = `${fecha}T${hora}:00`;
    const body = {
      fecha: fechaCompleta,
      motivo,
      persona_asignada_id: Number(staffId),
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
      const data = await response.json();
      if (response.status === 201) {
        setSuccessMsg(data.mensaje || "Cita agendada exitosamente");
        setFecha("");
        setHora("");
        setMotivo("");
        setStaffId("");
      } else {
        setErrorMsg(data.error || data.message || "Error al crear cita");
      }
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
    <>
      <div className="p-8 max-w-md mx-auto bg-white rounded-xl shadow relative">
        <h2 className="text-xl font-bold text-green-600 mb-4">Agendar Cita</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-400"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Motivo</label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo de la cita"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-400"
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
      </div>
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
    </>
  );
}