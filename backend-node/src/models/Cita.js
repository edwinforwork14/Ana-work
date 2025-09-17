  // src/models/Cita.js
const pool = require('../config/db');

// ...existing code...
const Cita = {
  // Obtener intervalos ocupados solo de citas confirmadas para un staff
  getStaffOcupadoConfirmadas: async (staffId) => {
    const q = `SELECT fecha, end_time FROM citas WHERE persona_asignada_id = $1 AND estado = 'confirmada'`;
    const result = await pool.query(q, [staffId]);
    return result.rows;
  },
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
        persona_asignada_id,
        recordatorio_enviado = false,
        duracion = 60 // minutos por defecto
      } = data;

      // Validar que se asigna staff
      if (!persona_asignada_id) {
        return { error: 'Debes seleccionar un staff para agendar la cita', success: false };
      }

      // Validar que el staff existe y tiene rol "staff"
      const staffRes = await pool.query('SELECT rol FROM usuarios WHERE id = $1', [persona_asignada_id]);
      if (!staffRes.rows[0] || staffRes.rows[0].rol !== 'staff') {
        return { error: 'El staff seleccionado no es válido', success: false };
      }

      // Calcular end_time
      const startTime = new Date(fecha);
      const endTime = new Date(startTime.getTime() + duracion * 60000);

      const result = await pool.query(
        `INSERT INTO citas (id_usuario, fecha, end_time, motivo, estado, persona_asignada_id, recordatorio_enviado, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
        [id_usuario, startTime, endTime, motivo, estado, persona_asignada_id, recordatorio_enviado]
      );
      return { cita: result.rows[0], success: true, mensaje: 'Cita agendada exitosamente' };
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

    // Consultar disponibilidad del staff (intervalos ocupados)
    getStaffOcupado: async (persona_asignada_id, fechaInicio, fechaFin) => {
      const result = await pool.query(
        `SELECT fecha, end_time
         FROM citas
         WHERE persona_asignada_id = $1
           AND estado NOT IN ('cancelada','completada')
           AND fecha >= $2 AND fecha < $3`,
        [persona_asignada_id, fechaInicio, fechaFin]
      );
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

    // Confirmar cita (staff): valida solapamiento solo con citas confirmadas
    confirmarCita: async (id) => {
      // Obtener la cita actual
      const citaRes = await pool.query('SELECT * FROM citas WHERE id = $1', [id]);
      const cita = citaRes.rows[0];
      if (!cita) return { error: 'Cita no encontrada', success: false };
      const { persona_asignada_id, fecha, end_time } = cita;

      // Validar solapamiento solo con citas confirmadas
      const overlapRes = await pool.query(
        `SELECT 1 FROM citas
         WHERE persona_asignada_id = $1
           AND estado = 'confirmada'
           AND (fecha, end_time) OVERLAPS ($2, $3)
           AND id <> $4`,
        [persona_asignada_id, fecha, end_time, id]
      );
      if (overlapRes.rows.length > 0) {
        return { error: 'Ya existe una cita confirmada en ese horario', success: false };
      }

      // Cambiar estado a confirmada
      const result = await pool.query(
        `UPDATE citas SET estado = 'confirmada', updated_at = NOW() WHERE id = $1 RETURNING *`,
        [id]
      );
      return { cita: result.rows[0], success: true, mensaje: 'Cita confirmada' };
    },
};

module.exports = Cita;