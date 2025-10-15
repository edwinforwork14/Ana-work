const { getDay, set, isWithinInterval } = require('date-fns');
// src/validators/schemas.js
const Joi = require('joi');

// Esquema para registro de usuario
const registerSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  rol: Joi.string().valid('admin', 'staff', 'cliente').required(),
  telefono: Joi.string().pattern(/^[0-9]{8,15}$/).required(),
  direccion: Joi.string().allow('', null),
  nombre_empresa: Joi.string().allow('', null),
  tipo_empresa: Joi.string().allow('', null),
  industria: Joi.string().allow('', null),
  rol_empresa: Joi.string().allow('', null)
});

// Esquema para login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Esquema para crear cita
const citaSchema = Joi.object({
  fecha: Joi.date().iso().required(),
  hora: Joi.string().required().custom((value, helpers) => {
    // Permitir formato HH:mm o HH:mm AM/PM
    let hora24 = value;
    if (/AM|PM/i.test(hora24)) {
      const [time, period] = hora24.split(/\s/);
      let [h, m] = time.split(":");
      h = parseInt(h);
      if (/PM/i.test(period) && h < 12) h += 12;
      if (/AM/i.test(period) && h === 12) h = 0;
      hora24 = `${h.toString().padStart(2, "0")}:${m}`;
    }
    // Validar formato HH:mm
    if (!/^\d{2}:\d{2}$/.test(hora24)) {
      return helpers.error('any.invalid');
    }
    const [h, m] = hora24.split(':').map(Number);
    if (h < 0 || h > 23 || m < 0 || m > 59) {
      return helpers.error('any.invalid');
    }
    return hora24;
  }),
  motivo: Joi.string().min(3).max(255).required(),
  id_staff: Joi.number().integer().required(),
  estado: Joi.string().valid('pendiente', 'confirmada', 'cancelada', 'completada').optional(),
  duracion: Joi.number().integer().min(1).max(480).optional(),
}).custom((data, helpers) => {
  // Validar día y horario permitido usando date-fns, forzando la hora a mediodía para evitar desfases de zona horaria
  try {
    let fechaObj = new Date(data.fecha);
    if (isNaN(fechaObj.getTime())) {
      return helpers.error('any.invalid', { message: 'Fecha inválida.' });
    }
    // Forzar hora a mediodía para evitar desfase UTC/local
    fechaObj = set(fechaObj, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });
    const dia = getDay(fechaObj); // 0=domingo, 1=lunes, ...
    // Convertir hora a 24h si viene en formato 12h
    let hora24 = data.hora;
    if (/AM|PM/i.test(hora24)) {
      const [time, period] = hora24.split(/\s/);
      let [h, m] = time.split(":");
      h = parseInt(h);
      if (/PM/i.test(period) && h < 12) h += 12;
      if (/AM/i.test(period) && h === 12) h = 0;
      hora24 = `${h.toString().padStart(2, "0")}:${m}`;
    }
    const [h, m] = hora24.split(':').map(Number);
    const citaDateTime = set(fechaObj, { hours: h, minutes: m, seconds: 0, milliseconds: 0 });

    if (dia === 0) {
      return helpers.error('any.invalid', { message: 'No se pueden agendar citas los domingos.' });
    }
    if (dia >= 1 && dia <= 5) {
      // Lunes a viernes: 7am a 6pm
      const inicio = set(fechaObj, { hours: 7, minutes: 0, seconds: 0, milliseconds: 0 });
      const fin = set(fechaObj, { hours: 18, minutes: 0, seconds: 0, milliseconds: 0 });
      if (!isWithinInterval(citaDateTime, { start: inicio, end: fin })) {
        return helpers.error('any.invalid', { message: 'Horario permitido: lunes a viernes de 7:00 a 18:00.' });
      }
    } else if (dia === 6) {
      // Sábado: 7am a 2pm
      const inicio = set(fechaObj, { hours: 7, minutes: 0, seconds: 0, milliseconds: 0 });
      const fin = set(fechaObj, { hours: 14, minutes: 0, seconds: 0, milliseconds: 0 });
      if (!isWithinInterval(citaDateTime, { start: inicio, end: fin })) {
        return helpers.error('any.invalid', { message: 'Horario permitido: sábados de 7:00 a 14:00.' });
      }
    }
    return data;
  } catch (e) {
    return helpers.error('any.invalid', { message: 'Fecha u hora inválida.' });
  }
}).unknown(true); // Permitir campos extra como fecha_hora_utc

module.exports = {
  registerSchema,
  loginSchema,
  citaSchema
};
