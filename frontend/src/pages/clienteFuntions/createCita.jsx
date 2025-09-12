
import { useState, useEffect } from "react";

export default function CreateCita() {
const [fecha, setFecha] = useState("");
const [motivo, setMotivo] = useState("");
const [successMsg, setSuccessMsg] = useState("");
const [waitMsg, setWaitMsg] = useState("");
const [errorMsg, setErrorMsg] = useState("");
const [isBlocked, setIsBlocked] = useState(false);
const [lastCreated, setLastCreated] = useState(0);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSuccessMsg("");
		setWaitMsg("");
		setErrorMsg("");
		const now = Date.now();
		if (isBlocked) {
			setWaitMsg("Por favor espere para agendar otra cita");
			return;
		}
		setIsBlocked(true);
		setLastCreated(now);
		setTimeout(() => setIsBlocked(false), 120000); // 2 minutos
		const token = localStorage.getItem('token');
		const body = {
			fecha,
			motivo
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
				setMotivo("");
				console.log("Status:", response.status, "Éxito:", data.mensaje || "Cita agendada exitosamente");
			} else if (response.status === 429) {
				setWaitMsg(data.error || "Por favor espere para agendar otra cita");
				console.log("Status:", response.status, "Espera:", data.error || "Por favor espere para agendar otra cita");
			} else {
				setErrorMsg(data.error || data.message || "Error al crear cita");
				console.log("Status:", response.status, "Error:", data.error || data.message || "Error al crear cita");
			}
		} catch (error) {
			setErrorMsg("Error de red");
			console.log("Error de red:", error);
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
