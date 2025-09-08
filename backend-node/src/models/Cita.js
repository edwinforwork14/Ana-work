// src/models/Cita.js
const pool = require('../config/db');

const Cita = {
  // Listar todas las citas (solo admin y staff)
  findAll: async () => {
    const result = await pool.query('SELECT * FROM citas');
    return result.rows;
  },
  create: async (data) => {
    const {
      id_usuario,
      fecha,
      motivo,
      estado = 'pendiente',
      persona_asignada_id = null,
      recordatorio_enviado = false,
    } = data;
    const result = await pool.query(
      `INSERT INTO citas (id_usuario, fecha, motivo, estado, persona_asignada_id, recordatorio_enviado)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id_usuario, fecha, motivo, estado, persona_asignada_id, recordatorio_enviado]
    );
    return result.rows[0];
  },

  // Buscar cita por ID
  findById: async (id) => {
    const result = await pool.query('SELECT * FROM citas WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Listar todas las citas de un usuario
  findAllByUsuario: async (id_usuario) => {
    const result = await pool.query('SELECT * FROM citas WHERE id_usuario = $1', [id_usuario]);
    return result.rows;
  },

  // Actualizar cita
update: async (id, data) => {
  // Definir columnas permitidas
  const allowed = ["fecha", "motivo", "estado"];

  // Obtener la cita actual
  const citaActual = await Cita.findById(id);
  if (!citaActual) {
    throw new Error("Cita no encontrada");
  }

  // Filtrar solo los campos permitidos y que realmente cambian
  const fields = [];
  const values = [];
  let idx = 1;
  let hayCambios = false;

  for (const key of allowed) {
    if (data.hasOwnProperty(key) && data[key] !== citaActual[key]) {
      fields.push(`${key} = $${idx}`);
      values.push(data[key]);
      idx++;
      hayCambios = true;
    }
  }

  // Si no hay cambios reales
  if (!hayCambios) {
    return { actualizado: false, mensaje: "Sin cambios: los valores son iguales o no hay campos válidos." };
  }

  // Agregar updated_at
  fields.push(`updated_at = NOW()`);
  values.push(id);

  const q = `
    UPDATE citas 
    SET ${fields.join(", ")} 
    WHERE id = $${idx} 
    RETURNING *;
  `;

  const result = await pool.query(q, values);
  return { actualizado: true, cita: result.rows[0] };
},

  // Eliminar cita
  delete: async (id) => {
    await pool.query('DELETE FROM citas WHERE id = $1', [id]);
  },
};

module.exports = Cita;