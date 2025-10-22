const pool = require("../config/db");
// Notificacion.js
// Modelo de notificación
const Notificacion = {
  // Eliminar todas las notificaciones asociadas a una cita
  eliminarPorCita: async (id_cita) => {
    await pool.query('DELETE FROM notificaciones WHERE id_cita = $1', [id_cita]);
  },
  listarPorStaff: async (id_staff) => {
  const q = `SELECT * FROM notificaciones WHERE id_staff = $1 AND "from" = 'cliente' ORDER BY creada_en DESC`;
  const result = await pool.query(q, [id_staff]);
  return result.rows;
  },
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
  crear: async ({ id_usuario, tipo, mensaje, id_staff, id_cita, from }) => {
    let q, params;
    // Por compatibilidad, si no viene, se asume 'cliente'
    from = from || 'cliente';
    if (id_staff && id_cita) {
      q = `INSERT INTO notificaciones (id_usuario, tipo, mensaje, id_staff, id_cita, "from") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
      params = [id_usuario, tipo, mensaje, id_staff, id_cita, from];
    } else if (id_staff) {
      q = `INSERT INTO notificaciones (id_usuario, tipo, mensaje, id_staff, "from") VALUES ($1, $2, $3, $4, $5) RETURNING *`;
      params = [id_usuario, tipo, mensaje, id_staff, from];
    } else if (id_cita) {
      q = `INSERT INTO notificaciones (id_usuario, tipo, mensaje, id_cita, "from") VALUES ($1, $2, $3, $4, $5) RETURNING *`;
      params = [id_usuario, tipo, mensaje, id_cita, from];
    } else {
      q = `INSERT INTO notificaciones (id_usuario, tipo, mensaje, "from") VALUES ($1, $2, $3, $4) RETURNING *`;
      params = [id_usuario, tipo, mensaje, from];
    }
    const result = await pool.query(q, params);
    return result.rows[0];
  },

  listarPorUsuario: async (id_usuario, id_staff) => {
    let q = `SELECT * FROM notificaciones WHERE id_usuario = $1 AND "from" = 'staff'`;
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



// Filtra notificaciones donde el remitente (cliente o staff) esté en una lista de IDs y el destinatario sea el usuario autenticado
Notificacion.listarPorRemitentes = async (remitenteIds, destinatarioId, rol) => {
  // Determinar el campo de destinatario según el rol
  let campoDestinatario = rol === 'staff' ? 'id_staff' : 'id_usuario';
  // El campo de remitente depende del tipo de notificación, aquí asumimos que el remitente es el otro participante de la cita
  // Se filtra por id_usuario o id_staff según corresponda
  let campoRemitente = rol === 'staff' ? 'id_usuario' : 'id_staff';
  // Construir la consulta
  const inClause = remitenteIds.length > 0 ? `AND ${campoRemitente} = ANY($1)` : '';
  const q = `SELECT * FROM notificaciones WHERE ${campoDestinatario} = $2 ${inClause} ORDER BY creada_en DESC`;
  const params = remitenteIds.length > 0 ? [remitenteIds, destinatarioId] : [[], destinatarioId];
  const result = await pool.query(q, params);
  return result.rows;
};

Notificacion.crearRecordatorio = async ({ cita, tipo, mensaje, from = 'cliente' }) => {
  const q = `
    INSERT INTO notificaciones (id_usuario, tipo, mensaje, id_staff, id_cita, "from")
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const params = [cita.id_usuario, tipo, mensaje, cita.id_staff || null, cita.id, from];
  const result = await pool.query(q, params);
  return result.rows[0];
};

module.exports = Notificacion;