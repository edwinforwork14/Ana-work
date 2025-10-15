// --- Requires y configuración ---
const DocumentoCita = require('../models/DocumentoCita');
const logger = require('../utils/logger');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });


const listarArchivosPorCita = async (req, res) => {
	try {
		const pool = require('../config/db');
		const id_cita = req.params.id_cita;
		let query = 'SELECT id, nombre, creado_en FROM documentos WHERE id_cita = $1';
		let params = [id_cita];
		if (req.user.rol === 'cliente') {
			query += ' AND id_usuario = $2';
			params.push(req.user.id);
		}
		const result = await pool.query(query, params);
		res.json({ archivos: result.rows });
	} catch (err) {
		res.status(500).json({ error: 'Error al obtener archivos de la cita', details: err.message });
	}
};

// --- Controladores ---

// 1. Servir documento por ID
const verDocumento = async (req, res) => {
	try {
	const doc = await DocumentoCita.findById(req.params.id_documento);
	logger.debug('doc:', doc);
		if (!doc) {
			logger.error('Documento no encontrado para id:', req.params.id_documento);
			return res.status(404).json({ error: 'Documento no encontrado' });
		}
		// Chequeo explícito del buffer
		if (!doc.archivo && !doc.archivoBuffer) {
			logger.error('Archivo binario no encontrado en la base de datos para el documento:', doc);
			return res.status(404).json({ error: 'Archivo no encontrado en la base de datos' });
		}
	logger.debug('archivoBuffer:', doc.archivo ? `Buffer (archivo) length: ${doc.archivo.length}` : '', doc.archivoBuffer ? `Buffer (archivoBuffer) length: ${doc.archivoBuffer.length}` : '');
		res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
		res.setHeader('Content-Disposition', `inline; filename="${doc.nombre}"`);
		// Algunos drivers pueden devolver el campo como 'archivo' o 'archivoBuffer'
		res.send(doc.archivo || doc.archivoBuffer);
	} catch (err) {
		logger.error('Error al servir documento:', err);
		res.status(500).json({ error: 'Error al servir el documento', details: err.message });
	}
};

// 1.b Forzar descarga (útil para Postman "Send and Download")
const downloadDocumento = async (req, res) => {
	try {
		const doc = await DocumentoCita.findById(req.params.id_documento);
		logger.debug('download doc:', doc && { id: doc.id, nombre: doc.nombre, mime_type: doc.mime_type });
		if (!doc) {
			const logger = require('../utils/logger');
			logger.error('Documento no encontrado para id (download):', req.params.id_documento);
			return res.status(404).json({ error: 'Documento no encontrado' });
		}

		// Obtener buffer y convertir si viene como string (hex) por alguna razón
		let fileBuffer = doc.archivo || doc.archivoBuffer;
		if (!fileBuffer) {
			const logger = require('../utils/logger');
			logger.error('Archivo binario no encontrado en la base de datos para el documento (download):', doc.id);
			return res.status(404).json({ error: 'Archivo no encontrado en la base de datos' });
		}

		// Si por alguna razón el campo vino como string (p.ej. '\\x...'), convertir a Buffer
		if (typeof fileBuffer === 'string') {
			try {
				if (fileBuffer.startsWith('\\x')) {
					fileBuffer = Buffer.from(fileBuffer.slice(2), 'hex');
				} else {
					// asumiendo encoding latin1/binary
					fileBuffer = Buffer.from(fileBuffer, 'binary');
				}
				logger.debug('Converted string field to Buffer for document', doc.id);
			} catch (convErr) {
				const logger = require('../utils/logger');
				logger.error('Error convirtiendo campo binario a Buffer:', convErr);
				return res.status(500).json({ error: 'Error procesando el archivo', details: convErr.message });
			}
		}

		const size = fileBuffer.length || 0;
		logger.debug(`download archivo length=${size}`);

		// Forzar descarga: attachment
		res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
		res.setHeader('Content-Disposition', `attachment; filename="${doc.nombre}"`);
		return res.send(fileBuffer);
	} catch (err) {
		logger.error('Error al forzar descarga del documento:', err);
		return res.status(500).json({ error: 'Error al descargar el documento', details: err.message });
	}
};

// debugDocumento removed per cleanup request

// (rawDocumento removed) temporary debug/raw endpoint removed - use /download or /debug instead

// 2. Obtener documentos subidos por el usuario autenticado, con filtros opcionales
const obtenerDocumentos = async (req, res) => {
	try {
		const id_usuario = req.user.id;
		const { id_cita, fecha } = req.query;
		let query = 'SELECT * FROM documentos WHERE id_usuario = $1';
		const params = [id_usuario];
		if (id_cita) {
			query += ' AND id_cita = $2';
			params.push(id_cita);
		}
		if (fecha) {
			// Filtrar por fecha de la cita asociada (requiere JOIN)
			query = `SELECT d.* FROM documentos d JOIN citas c ON d.id_cita = c.id WHERE d.id_usuario = $1 AND c.fecha::date = $2`;
			params[1] = fecha;
		}
		query += ' ORDER BY creado_en DESC';
		const pool = require('../config/db');
		const result = await pool.query(query, params);
		res.json({ documentos: result.rows });
	} catch (err) {
		res.status(500).json({ error: 'Error al obtener documentos', details: err.message });
	}
};

// 3. Subir documento
const subirDocumento = async (req, res) => {
	try {
		const { id_cita } = req.body;
		if (!req.file) {
			return res.status(400).json({ error: 'No se envió archivo.' });
		}
		const nombre = req.file.originalname;
		const archivoBuffer = req.file.buffer;
		const mime_type = req.file.mimetype;
		// Extraer id_usuario del usuario autenticado (req.user)
		const id_usuario = req.user && req.user.id ? req.user.id : null;
		if (!id_usuario) {
			return res.status(401).json({ error: 'No se pudo identificar el usuario autenticado.' });
		}
		const doc = await DocumentoCita.subirDocumento({ nombre, archivoBuffer, id_cita, id_usuario, mime_type });

		// Notificación al staff asignado a la cita
		const pool = require('../config/db');
		const citaResult = await pool.query('SELECT id_staff FROM citas WHERE id = $1', [id_cita]);
		const id_staff = citaResult.rows[0] ? citaResult.rows[0].id_staff : null;
				if (id_staff) {
						const Notificacion = require('../models/Notificacion');
						// Intentar resolver nombre legible del staff para la notificación
						let nombreStaff = null;
						try {
							const r = await pool.query('SELECT nombre FROM usuarios WHERE id = $1', [id_staff]);
							nombreStaff = r.rows[0] ? r.rows[0].nombre : null;
						} catch (e) {
							nombreStaff = null;
						}
						const staffLabel = nombreStaff || 'Staff';
						await Notificacion.crear({
								id_usuario,
								id_staff,
								id_cita,
								tipo: 'documento_subido',
								mensaje: `Se ha subido un documento (${nombre}) a la cita ${id_cita} por el cliente. Notifica a ${staffLabel}.`,
								from: 'cliente'
						});
				}
		res.status(201).json({ documento: doc, success: true });
	} catch (err) {
		res.status(500).json({ error: 'Error al subir documento', details: err.message });
	}
};

// 4. Eliminar documento (la lógica de permisos está en el middleware)
const eliminarDocumento = async (req, res) => {
	try {
		const { id_documento, id_cita } = req.body;
		// Llamamos al modelo; el modelo ahora intentará derivar id_cita si no se proporciona.
		await DocumentoCita.eliminarDocumento({ id_documento, id_cita });
		// Responder con éxito y echo del id_cita afectado (si estaba disponible)
		res.status(200).json({ message: 'Documento eliminado correctamente', id_cita: id_cita || null });
	} catch (err) {
		res.status(500).json({ error: 'Error eliminando documento', details: err.message });
	}
};

// --- Exports ---
module.exports = {
  subirDocumento,
  upload,
  obtenerDocumentos,
  eliminarDocumento,
  verDocumento,
  downloadDocumento,
  listarArchivosPorCita,
	// debugDocumento removed
};
