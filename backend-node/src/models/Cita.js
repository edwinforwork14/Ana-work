  // src/models/Cita.js
const pool = require('../config/db');

// ...existing code...
const Cita = {
  // Marcar automáticamente como completadas las citas confirmadas cuyo end_time ya pasó
  marcarCompletadasAutomatico: async (now = new Date()) => {
    // Solo citas confirmadas y end_time menor a ahora
    await pool.query(
      `UPDATE citas SET estado = 'completada', updated_at = NOW()
       WHERE estado = 'confirmada' AND end_time < $1`,
      [now]
    );
  },
  // Obtener intervalos ocupados solo de citas confirmadas para un staff (solo futuras)
  getStaffOcupadoConfirmadas: async (staffId) => {
    const now = new Date();
    const q = `SELECT fecha, end_time FROM citas WHERE id_staff = $1 AND estado = 'confirmada' AND end_time > $2`;
    const result = await pool.query(q, [staffId, now]);
    return result.rows;
  },

    // Listar todas las citas de un staff por estado
  findAllByStaffAndEstado: async (id_staff, estado) => {
    let q = 'SELECT * FROM citas WHERE id_staff = $1';
    const params = [id_staff];
    if (estado && estado !== 'todas') {
      q += ' AND estado = $2';
      params.push(estado);
    }
    const result = await pool.query(q, params);
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
        id_staff,
        recordatorio_enviado = false,
        duracion = 60 // minutos por defecto
      } = data;

      // Validar que se asigna staff

      if (!id_staff) {
        return { error: 'Debes seleccionar un staff para agendar la cita', success: false };
      }

      // Validar que el staff existe y tiene rol "staff"
      const staffRes = await pool.query('SELECT rol FROM usuarios WHERE id = $1', [id_staff]);
      if (!staffRes.rows[0] || staffRes.rows[0].rol !== 'staff') {
        return { error: 'El staff seleccionado no es válido', success: false };
      }

      // Calcular end_time
      const startTime = new Date(fecha);
      const endTime = new Date(startTime.getTime() + duracion * 60000);

      // Validar que no exista una cita confirmada en ese horario
      const overlapRes = await pool.query(
        `SELECT 1 FROM citas
         WHERE id_staff = $1
           AND estado = 'confirmada'
           AND (fecha < $3 AND end_time > $2)`,
        [id_staff, startTime, endTime]
      );
      if (overlapRes.rows.length > 0) {
        return { error: 'Ya existe una cita confirmada en ese horario', success: false };
      }

      const result = await pool.query(
  `INSERT INTO citas (id_usuario, fecha, end_time, motivo, estado, id_staff, recordatorio_enviado, created_at)
   VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
  [id_usuario, startTime, endTime, motivo, estado, id_staff, recordatorio_enviado]
      );
      return { cita: result.rows[0], success: true, mensaje: 'Cita agendada exitosamente' };
  },

  // Buscar cita por ID (con JOIN a usuarios y staff)
  findById: async (id) => {
    const q = `
      SELECT c.*, 
             u.nombre AS nombre_usuario, u.email AS email_usuario, u.telefono AS telefono_usuario,
             s.nombre AS nombre_staff, s.email AS email_staff, s.telefono AS telefono_staff
      FROM citas c
      JOIN usuarios u ON c.id_usuario = u.id
      LEFT JOIN usuarios s ON c.id_staff = s.id
      WHERE c.id = $1
    `;
    const result = await pool.query(q, [id]);
    return result.rows[0];
  },

  // Listar todas las citas de un usuario
  findAllByUsuario: async (id_usuario) => {
    const result = await pool.query('SELECT * FROM citas WHERE id_usuario = $1', [id_usuario]);
    return result.rows;
  },

    // Consultar disponibilidad del staff (intervalos ocupados)
    getStaffOcupado: async (id_staff, fechaInicio, fechaFin) => {
      const result = await pool.query(
        `SELECT fecha, end_time
         FROM citas
         WHERE id_staff = $1
           AND estado NOT IN ('cancelada','completada')
           AND fecha >= $2 AND fecha < $3`,
        [id_staff, fechaInicio, fechaFin]
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
    console.log("[Cita.update] Sin cambios detectados");
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

  // DEBUG: Log query and values
  console.log("[Cita.update] query:", q);
  console.log("[Cita.update] values:", values);

  const result = await pool.query(q, values);
  console.log("[Cita.update] result:", result.rows[0]);
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
      if (!cita) {
        console.log(`[confirmarCita] Cita no encontrada para id=${id}`);
        return { error: 'Cita no encontrada', success: false };
      }
      const { id_staff, fecha, end_time, estado } = cita;
      console.log(`[confirmarCita] Intentando confirmar cita id=${id}, estado=${estado}, staff=${id_staff}, fecha=${fecha}, end_time=${end_time}`);

      // Validar solapamiento solo con citas confirmadas (cualquier cruce)
      const overlapRes = await pool.query(
        `SELECT * FROM citas
         WHERE id_staff = $1
           AND estado = 'confirmada'
           AND id <> $4
           AND (fecha < $3 AND end_time > $2)`,
        [id_staff, fecha, end_time, id]
      );
      if (overlapRes.rows.length > 0) {
        console.log(`[confirmarCita] Solapamiento detectado con citas:`, overlapRes.rows);
        return { error: 'Ya existe una cita confirmada en ese horario', success: false };
      }

      // Cambiar estado a confirmada
      const result = await pool.query(
        `UPDATE citas SET estado = 'confirmada', updated_at = NOW() WHERE id = $1 RETURNING *`,
        [id]
      );
      console.log(`[confirmarCita] Cita confirmada id=${id}`);
      return { cita: result.rows[0], success: true, mensaje: 'Cita confirmada' };
    },
};

module.exports = Cita;