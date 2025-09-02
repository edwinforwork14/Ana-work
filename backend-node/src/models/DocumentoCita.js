const pool = require("../config/db");

class DocumentoCita {
  static async subir({ cita_id, nombre, url }) {
    const result = await pool.query(
      `INSERT INTO documentos_cita (cita_id, nombre, url, estado) 
       VALUES ($1, $2, $3, 'subido') 
       RETURNING *`,
      [cita_id, nombre, url]
    );
    return result.rows[0];
  }

  static async findByCita(citaId) {
    const result = await pool.query(
      "SELECT * FROM documentos_cita WHERE cita_id = $1",
      [citaId]
    );
    return result.rows;
  }

  static async cambiarEstado(id, estado) {
    const result = await pool.query(
      `UPDATE documentos_cita 
       SET estado = $1 
       WHERE id = $2 
       RETURNING *`,
      [estado, id]
    );
    return result.rows[0];
  }
}

module.exports = DocumentoCita;
