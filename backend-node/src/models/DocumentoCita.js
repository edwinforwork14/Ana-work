const pool = require('../config/db');

const DocumentoCita = {
	subirDocumento: async ({ nombre, archivoBuffer, id_cita }) => {
		// archivoBuffer debe ser un Buffer (binario)
		const result = await pool.query(
			`INSERT INTO documentos (nombre, archivo, id_cita, creado_en) VALUES ($1, $2, $3, NOW()) RETURNING *`,
			[nombre, archivoBuffer, id_cita]
		);
		return result.rows[0];
	},
	// ...otros métodos...
};

module.exports = DocumentoCita;
