
import { useState, useEffect } from "react";

export default function UploadDocument() {
	const [file, setFile] = useState(null);
	const [idCita, setIdCita] = useState("");
	const [successMsg, setSuccessMsg] = useState("");
	const [errorMsg, setErrorMsg] = useState("");
	const [loading, setLoading] = useState(false);

	// Ocultar mensajes después de 3 segundos
	useEffect(() => {
		if (successMsg) {
			const timer = setTimeout(() => setSuccessMsg("") , 3000);
			return () => clearTimeout(timer);
		}
	}, [successMsg]);
	useEffect(() => {
		if (errorMsg) {
			const timer = setTimeout(() => setErrorMsg("") , 3000);
			return () => clearTimeout(timer);
		}
	}, [errorMsg]);

	const handleFileChange = (e) => {
			const selected = e.target.files[0];
			if (!selected) return;
			// Validar tipo de archivo (PDF, imagen, Word)
			const allowedTypes = [
				'application/pdf',
				'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
				'application/msword',
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
			];
			if (!allowedTypes.includes(selected.type)) {
				setErrorMsg('Solo se permiten archivos PDF, imágenes o Word.');
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
			setErrorMsg("Debes seleccionar un archivo y una cita");
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
						"Authorization": `Bearer ${token}`
					},
					body: formData
				});
				const data = await res.json();
				if (res.ok && data.success) {
					setSuccessMsg("Documento subido correctamente");
					setFile(null);
					setIdCita("");
				} else {
					setErrorMsg(data.error || "Error al subir documento");
				}
			} catch (err) {
				setErrorMsg("Error de red");
			}
			setLoading(false);
	};

	return (
		<div className="flex flex-row gap-8 justify-center">
			{/* Formulario */}
			<div className="p-8 max-w-md w-[40vw] min-w-[340px] bg-white rounded-xl shadow relative">
				<h2 className="text-xl font-bold text-blue-700 mb-4">Subir documento de cita</h2>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block font-semibold mb-1">ID de la cita</label>
						<input
							type="text"
							value={idCita}
							onChange={e => setIdCita(e.target.value)}
							className="w-full border px-3 py-2 rounded"
							required
						/>
					</div>
					<div>
						<label className="block font-semibold mb-1">Archivo</label>
						<input
							type="file"
							onChange={handleFileChange}
							className="w-full border px-3 py-2 rounded"
							required
						/>
					</div>
					<button
						type="submit"
						className="bg-blue-600 text-white px-4 py-2 rounded font-bold w-full"
						disabled={loading}
					>
						{loading ? "Subiendo..." : "Subir documento"}
					</button>
				</form>
				{successMsg && (
					<div className="mt-4 text-green-600 font-semibold text-center">{successMsg}</div>
				)}
				{errorMsg && (
					<div className="mt-4 text-red-600 font-semibold text-center">{errorMsg}</div>
				)}
			</div>
			{/* Información adicional */}
			<div className="p-8 w-[320px] min-w-[220px] bg-purple-50 border border-purple-200 rounded-xl shadow h-fit self-start">
				<h3 className="text-lg font-bold text-purple-700 mb-2">Instrucciones</h3>
				<ul className="list-disc ml-4 text-purple-900 text-sm">
					<li>Solo puedes subir documentos PDF, imágenes o Word.</li>
					<li>El archivo se asociará a la cita indicada por el ID.</li>
					<li>Si tienes dudas, consulta con el staff.</li>
				</ul>
				<div className="mt-4 text-xs text-purple-700">
					<b>Nota:</b> El staff podrá revisar los documentos subidos y asociarlos a tu expediente.
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
