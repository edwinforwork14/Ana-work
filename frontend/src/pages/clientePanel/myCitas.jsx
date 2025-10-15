import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MyCitas() {
	const navigate = useNavigate();
	const [citas, setCitas] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [deleting, setDeleting] = useState(false);

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

	const handleDeleteCita = async (id) => {
		if (window.confirm('¿Seguro que deseas eliminar esta cita?')) {
			setDeleting(true);
			try {
				const token = localStorage.getItem('token');
				const res = await fetch(`http://localhost:3000/api/citas/${id}`, {
					method: 'DELETE',
					headers: {
						'Authorization': `Bearer ${token}`
					}
				});
				if (!res.ok) throw new Error('No se pudo eliminar la cita');
				setCitas(prev => prev.filter(c => c.id !== id));
			} catch (err) {
				setError(err.message || 'Error al eliminar cita');
			}
			setDeleting(false);
		}
	};

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
								<th className="px-2 py-1 border">Eliminar</th>
								<th className="px-2 py-1 border">ID Cita</th>
								<th className="px-2 py-1 border">Fecha</th>
								<th className="px-2 py-1 border">Motivo</th>
								<th className="px-2 py-1 border">Estado</th>
								<th className="px-2 py-1 border">Asignado a</th>
								<th className="px-2 py-1 border">Recordatorio</th>
								<th className="px-2 py-1 border">Creada</th>
								<th className="px-2 py-1 border">Documento</th>
							</tr>
						</thead>
						<tbody>
							{citas.length === 0 && (
								<tr><td colSpan={8} className="text-center py-2">No tienes citas registradas.</td></tr>
							)}
							{citas.map(cita => (
								<tr key={cita.id} className="hover:bg-blue-50">
									<td className="border px-2 py-1">
										<button
											disabled={deleting}
											className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs"
											title="Eliminar cita"
											onClick={() => handleDeleteCita(cita.id)}
										>
											🗑️
										</button>
									</td>
									<td className="border px-2 py-1">{cita.id}</td>
									<td className="border px-2 py-1">{cita.fecha ? `${cita.fecha.slice(0, 10)}${cita.hora_12h ? ' ' + cita.hora_12h : ''}` : ''}</td>
									<td className="border px-2 py-1">{cita.motivo}</td>
									<td className="border px-2 py-1">{cita.estado}</td>
									<td className="border px-2 py-1">{cita.id_staff || '-'}</td>
									<td className="border px-2 py-1">{cita.recordatorio_enviado ? 'Sí' : 'No'}</td>
									<td className="border px-2 py-1">{cita.created_at ? cita.created_at.slice(0, 19).replace('T', ' ') : ''}</td>
														<td className="border px-2 py-1">
															{cita.documento === true && (
																<button
																	className="text-blue-700 underline hover:text-blue-900"
																	onClick={() => navigate(`/ver-mis-documentos/${cita.id}`)}
																>
																	Ver
																</button>
															)}
														</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
