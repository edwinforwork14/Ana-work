// Notificacion.js
// Modelo de notificación
const pool = require("../config/db");

const Notificacion = {
    listarTodas: async (id_staff) => {
      let q = `SELECT * FROM notificaciones`;
      const params = [];
      if (id_staff) {
        q += ' WHERE id_staff = $1';
        params.push(id_staff);
      }
      q += ' ORDER BY creada_en DESC';
      const result = await pool.query(q, params);
      return result.rows;
    },
  crear: async ({ id_usuario, tipo, mensaje, id_staff, id_cita }) => {
    let q, params;
    if (id_staff && id_cita) {
      q = `INSERT INTO notificaciones (id_usuario, tipo, mensaje, id_staff, id_cita) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
      params = [id_usuario, tipo, mensaje, id_staff, id_cita];
    } else if (id_staff) {
      q = `INSERT INTO notificaciones (id_usuario, tipo, mensaje, id_staff) VALUES ($1, $2, $3, $4) RETURNING *`;
      params = [id_usuario, tipo, mensaje, id_staff];
    } else if (id_cita) {
      q = `INSERT INTO notificaciones (id_usuario, tipo, mensaje, id_cita) VALUES ($1, $2, $3, $4) RETURNING *`;
      params = [id_usuario, tipo, mensaje, id_cita];
    } else {
      q = `INSERT INTO notificaciones (id_usuario, tipo, mensaje) VALUES ($1, $2, $3) RETURNING *`;
      params = [id_usuario, tipo, mensaje];
    }
    const result = await pool.query(q, params);
    return result.rows[0];
  },

  listarPorUsuario: async (id_usuario, id_staff) => {
    let q = `SELECT * FROM notificaciones WHERE id_usuario = $1`;
    const params = [id_usuario];
    if (id_staff) {
      q += ' AND id_staff = $2';
      params.push(id_staff);
    }
    q += ' ORDER BY creada_en DESC';
    const result = await pool.query(q, params);
    return result.rows;
  },

  marcarLeida: async (id) => {
    const q = `UPDATE notificaciones SET leida = true WHERE id = $1 RETURNING *`;
    const result = await pool.query(q, [id]);
    return result.rows[0];
  }
};

module.exports = Notificacion;
