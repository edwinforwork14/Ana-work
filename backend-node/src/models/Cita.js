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
      // ...existing code...
      // Validar que la cita no sea en un día anterior al actual
      const now = new Date();
      let hora24 = data.hora;
      if (/AM|PM/i.test(hora24)) {
        const [time, period] = hora24.split(/\s/);
        let [h, m] = time.split(":");
        h = parseInt(h);
        if (/PM/i.test(period) && h < 12) h += 12;
        if (/AM/i.test(period) && h === 12) h = 0;
        hora24 = `${h.toString().padStart(2, "0")}:${m}`;
      }
      let citaDate;
      if (data.fecha && hora24) {
        citaDate = new Date(`${data.fecha}T${hora24}:00`);
      } else {
        citaDate = new Date(data.fecha);
      }
      // Normalizar fechas a solo año-mes-día para comparar días
      const citaDay = new Date(citaDate.getFullYear(), citaDate.getMonth(), citaDate.getDate());
      const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (citaDay < nowDay) {
        return { error: 'No puedes agendar una cita en un día anterior al actual', success: false };
      }
      const {
        id_usuario,
        fecha,
        hora,
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

      // Combinar fecha y hora correctamente
      let startTime;
      if (fecha && hora24) {
        startTime = new Date(`${fecha}T${hora24}:00`);
      } else {
        startTime = new Date(fecha);
      }
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
    const cita = result.rows[0];
    if (cita) {
      // Formatear hora en 12h para frontend
      const fechaObj = new Date(cita.fecha);
      let hora = fechaObj.getHours();
      let minutos = fechaObj.getMinutes();
      let period = hora >= 12 ? "PM" : "AM";
      hora = hora % 12;
      if (hora === 0) hora = 12;
      cita.hora_12h = `${hora.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")} ${period}`;
    }
    return cita;
  },

  // Listar todas las citas de un usuario
  findAllByUsuario: async (id_usuario) => {
    const result = await pool.query('SELECT * FROM citas WHERE id_usuario = $1', [id_usuario]);
    return result.rows;
  },

    // Consultar disponibilidad del staff (intervalos ocupados)
    // Consultar disponibilidad completa: bloques libres y ocupados
    getStaffOcupado: async (id_staff, fechaInicio, fechaFin) => {
      // 1. Obtener citas ocupadas en el rango
      const result = await pool.query(
        `SELECT fecha, end_time
         FROM citas
         WHERE id_staff = $1
           AND estado NOT IN ('cancelada','completada')
           AND fecha >= $2 AND fecha < $3`,
        [id_staff, fechaInicio, fechaFin]
      );
      const ocupadas = result.rows;

      // 2. Generar bloques posibles según reglas de schemas.js
      const { getDay, set } = require('date-fns');
      const bloques = [];
      const startDate = new Date(fechaInicio);
      const endDate = new Date(fechaFin);
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dia = getDay(d); // 0=domingo, 1=lunes, ...
        let horarios = [];
        if (dia === 0) continue; // domingo no hay bloques
        if (dia >= 1 && dia <= 5) {
          // Lunes a viernes: 7am a 18pm
          horarios = Array.from({length: 12}, (_, i) => 7 + i); // 7 a 18
        } else if (dia === 6) {
          // Sábado: 7am a 14pm
          horarios = Array.from({length: 8}, (_, i) => 7 + i); // 7 a 14
        }
        for (const h of horarios) {
          const blockStart = set(new Date(d), { hours: h, minutes: 0, seconds: 0, milliseconds: 0 });
          const blockEnd = set(new Date(d), { hours: h+1, minutes: 0, seconds: 0, milliseconds: 0 });
          // Verificar si está ocupado
          const ocupado = ocupadas.some(o => {
            const oStart = new Date(o.fecha);
            const oEnd = new Date(o.end_time);
            return blockStart < oEnd && blockEnd > oStart;
          });
          bloques.push({ start: blockStart, end: blockEnd, ocupado });
        }
      }
      return bloques;
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
    require('../utils/logger').debug("[Cita.update] Sin cambios detectados");
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
  require('../utils/logger').debug("[Cita.update] query:", q);
  require('../utils/logger').debug("[Cita.update] values:", values);

  const result = await pool.query(q, values);
  require('../utils/logger').debug("[Cita.update] result:", result.rows[0]);
  return { actualizado: true, cita: result.rows[0] };
},

  // Eliminar cita
  delete: async (id) => {
    // Eliminar notificaciones asociadas antes de borrar la cita
    const Notificacion = require('./Notificacion');
    await Notificacion.eliminarPorCita(id);
    await pool.query('DELETE FROM citas WHERE id = $1', [id]);
  },

    // Confirmar cita (staff): valida solapamiento solo con citas confirmadas
    confirmarCita: async (id) => {
      // Obtener la cita actual
      const citaRes = await pool.query('SELECT * FROM citas WHERE id = $1', [id]);
      const cita = citaRes.rows[0];
      if (!cita) {
    require('../utils/logger').debug(`[confirmarCita] Cita no encontrada para id=${id}`);
        return { error: 'Cita no encontrada', success: false };
      }
      const { id_staff, fecha, end_time, estado } = cita;
  require('../utils/logger').debug(`[confirmarCita] Intentando confirmar cita id=${id}, estado=${estado}, staff=${id_staff}, fecha=${fecha}, end_time=${end_time}`);

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
  require('../utils/logger').debug(`[confirmarCita] Solapamiento detectado con citas:`, overlapRes.rows);
        return { error: 'Ya existe una cita confirmada en ese horario', success: false };
      }

      // Cambiar estado a confirmada
      const result = await pool.query(
        `UPDATE citas SET estado = 'confirmada', updated_at = NOW() WHERE id = $1 RETURNING *`,
        [id]
      );
  require('../utils/logger').debug(`[confirmarCita] Cita confirmada id=${id}`);
      return { cita: result.rows[0], success: true, mensaje: 'Cita confirmada' };
    },
};

module.exports = Cita;