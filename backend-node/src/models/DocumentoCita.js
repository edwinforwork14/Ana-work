const pool = require('../config/db');

const DocumentoCita = {
	// Buscar documento por ID
	findById: async (id) => {
		const result = await pool.query('SELECT * FROM documentos WHERE id = $1', [id]);
		return result.rows[0] || null;
	},
		subirDocumento: async ({ nombre, archivoBuffer, id_cita, id_usuario, mime_type }) => {
			// archivoBuffer debe ser un Buffer (binario)
			// Insertar el documento
			const insertResult = await pool.query(
				`INSERT INTO documentos (nombre, archivo, id_cita, id_usuario, mime_type, creado_en) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
				[nombre, archivoBuffer, id_cita, id_usuario, mime_type]
			);
			// Actualizar la cita para marcar que tiene documento
			await pool.query(
				`UPDATE citas SET documento = true WHERE id = $1`,
				[id_cita]
			);
			const documento = insertResult.rows[0];
			// Hacer JOIN para traer los datos de la cita asociada
			const joinResult = await pool.query(
				`SELECT d.*, c.fecha, c.motivo, c.id_staff, c.id_usuario
					 FROM documentos d
					 JOIN citas c ON d.id_cita = c.id
					 WHERE d.id = $1`,
				[documento.id]
			);
			return joinResult.rows[0];
		},
	eliminarDocumento: async ({ id_documento, id_cita }) => {
		// Hacer la operación de forma atómica y resiliente.
		// Si no se recibe id_cita, lo consultamos antes de borrar.
		const client = await pool.connect();
		try {
			await client.query('BEGIN');
			let citaId = id_cita;
			if (!citaId) {
				const r = await client.query('SELECT id_cita FROM documentos WHERE id = $1', [id_documento]);
				citaId = r.rows[0] ? r.rows[0].id_cita : null;
			}
			// Eliminar el documento
			await client.query('DELETE FROM documentos WHERE id = $1', [id_documento]);
			// Si conocemos la cita, verificar si quedan documentos
			if (citaId) {
				const result = await client.query('SELECT COUNT(*) FROM documentos WHERE id_cita = $1', [citaId]);
				if (parseInt(result.rows[0].count, 10) === 0) {
					// Si no quedan documentos, poner el campo en false
					await client.query('UPDATE citas SET documento = false WHERE id = $1', [citaId]);
				}
			}
			await client.query('COMMIT');
		} catch (err) {
			await client.query('ROLLBACK');
			throw err;
		} finally {
			client.release();
		}
	},
};

module.exports = DocumentoCita;
