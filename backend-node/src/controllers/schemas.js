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
  hora: Joi.string().required(),
  motivo: Joi.string().min(3).max(255).required(),
  id_staff: Joi.number().integer().required(),
  estado: Joi.string().valid('pendiente', 'confirmada', 'cancelada', 'completada').optional(),
  duracion: Joi.number().integer().min(1).max(480).optional() // minutos, ajusta el rango si lo deseas
});

module.exports = {
  registerSchema,
  loginSchema,
  citaSchema
};
