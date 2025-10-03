const DocumentoCita = require('../models/DocumentoCita');
const multer = require('multer');

// Configuración de multer para recibir archivos
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Endpoint para subir documento
const subirDocumento = async (req, res) => {
	try {
		const { id_cita } = req.body;
		if (!req.file) {
			return res.status(400).json({ error: 'No se envió archivo.' });
		}
		const nombre = req.file.originalname;
		const archivoBuffer = req.file.buffer;
		const doc = await DocumentoCita.subirDocumento({ nombre, archivoBuffer, id_cita });
		res.status(201).json({ documento: doc, success: true });
	} catch (err) {
		res.status(500).json({ error: 'Error al subir documento', details: err.message });
	}
};

module.exports = {
	subirDocumento,
	upload,
};
// documentoController.js
// Controlador para documentos
