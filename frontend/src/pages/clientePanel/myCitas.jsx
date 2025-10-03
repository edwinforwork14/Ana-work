import React, { useEffect, useState } from 'react';

export default function MyCitas() {
	const [citas, setCitas] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchCitas = async () => {
			setLoading(true);
			setError("");
			try {
				const token = localStorage.getItem('token');
				const res = await fetch('http://localhost:3000/api/citas', {
					headers: {
						'Authorization': `Bearer ${token}`
					}
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

	return (
		<div className="p-8">
			<h2 className="text-xl font-bold text-blue-600 mb-4">Mis Citas</h2>
			{loading && <p className="text-gray-500">Cargando citas...</p>}
			{error && <p className="text-red-600">{error}</p>}
			{!loading && !error && (
				<div className="overflow-x-auto">
					<table className="min-w-full border text-sm">
						<thead>
							<tr className="bg-blue-100">
								<th className="px-2 py-1 border">Fecha</th>
								<th className="px-2 py-1 border">Motivo</th>
								<th className="px-2 py-1 border">Estado</th>
								<th className="px-2 py-1 border">Asignado a</th>
								<th className="px-2 py-1 border">Recordatorio</th>
								<th className="px-2 py-1 border">Creada</th>
							</tr>
						</thead>
						<tbody>
							{citas.length === 0 && (
								<tr><td colSpan={6} className="text-center py-2">No tienes citas registradas.</td></tr>
							)}
							{citas.map(cita => (
								<tr key={cita.id} className="hover:bg-blue-50">
									<td className="border px-2 py-1">{cita.fecha ? `${cita.fecha.slice(0, 10)}${cita.hora_12h ? ' ' + cita.hora_12h : ''}` : ''}</td>
									<td className="border px-2 py-1">{cita.motivo}</td>
									<td className="border px-2 py-1">{cita.estado}</td>
									<td className="border px-2 py-1">{cita.id_staff || '-'}</td>
									<td className="border px-2 py-1">{cita.recordatorio_enviado ? 'Sí' : 'No'}</td>
									<td className="border px-2 py-1">{cita.created_at ? cita.created_at.slice(0, 19).replace('T', ' ') : ''}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
