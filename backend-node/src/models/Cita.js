// src/models/Cita.js
const pool = require('../config/db');

const Cita = {
  create: async (data) => {
    const {
      cliente_id,
      fecha,
      motivo,
      estado = 'pendiente',
      persona_asignada_id = null,
      recordatorio_enviado = false,
    } = data;
    const result = await pool.query(
      `INSERT INTO citas (cliente_id, fecha, motivo, estado, persona_asignada_id, recordatorio_enviado)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [cliente_id, fecha, motivo, estado, persona_asignada_id, recordatorio_enviado]
    );
    return result.rows[0];
  },

  // Buscar cita por ID
  findById: async (id) => {
    const result = await pool.query('SELECT * FROM citas WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Listar todas las citas de un cliente
  findAllByCliente: async (cliente_id) => {
    const result = await pool.query('SELECT * FROM citas WHERE cliente_id = $1', [cliente_id]);
    return result.rows;
  },

  // Actualizar cita
  update: async (id, data) => {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const key in data) {
      fields.push(`${key} = $${idx}`);
      values.push(data[key]);
      idx++;
    }
    values.push(id);
    const q = `UPDATE citas SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;
    const result = await pool.query(q, values);
    return result.rows[0];
  },

  // Eliminar cita
  delete: async (id) => {
    await pool.query('DELETE FROM citas WHERE id = $1', [id]);
  },
};

module.exports = Cita;