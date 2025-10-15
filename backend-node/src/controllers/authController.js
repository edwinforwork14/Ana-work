// authController.js
// Controlador para autenticación
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/auth");
const { registerSchema, loginSchema } = require("./schemas");

// Helper: construir payload de la "sesión personalizada"
const buildSessionPayload = (u) => ({
  id: u.id,
  email: u.email,
  rol: u.rol,
  persona: { nombre: u.nombre, telefono: u.telefono, direccion: u.direccion },
  company: {
    nombre: u.nombre_empresa,
    tipo: u.tipo_empresa,
    industria: u.industria,
    rol: u.rol_empresa,
  }
});

const authController = {

  register: async (req, res) => {
    // Validar datos de entrada
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    try {
      const {
        nombre, email, password, rol,
        telefono, direccion, nombre_empresa, tipo_empresa, industria, rol_empresa
      } = req.body;

      const exists = await Usuario.findByEmail(email);
      if (exists) return res.status(400).json({ error: "El email ya está registrado" });

      const hashed = await bcrypt.hash(password, 10);

      const nuevo = await Usuario.create({
        nombre, email, password: hashed, rol,
        telefono, direccion, nombre_empresa, tipo_empresa, industria, rol_empresa
      });

      // para el token necesitamos un objeto con todos los campos:
      const fullForToken = {
        ...nuevo,
        email,
        nombre,
        telefono,
        direccion,
        nombre_empresa,
        tipo_empresa,
        industria,
        rol_empresa
      };

      const payload = buildSessionPayload(fullForToken);
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      res.status(201).json({ mensaje: "Usuario registrado", usuario: nuevo, token });
    } catch (e) {
  const logger = require('../utils/logger');
  logger.error(e);
      res.status(500).json({ error: "Error en el registro" });
    }
  },

  login: async (req, res) => {
    // Validar datos de entrada
    const { error } = loginSchema.validate(req.body);
    if (error) {
  const logger = require('../utils/logger');
  logger.error("[login] Error de validación:", error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }
    try {
      const { email, password } = req.body;

      const user = await Usuario.findByEmail(email);
      if (!user) {
  const logger = require('../utils/logger');
  logger.error(`[login] Usuario no encontrado para email: ${email}`);
        return res.status(400).json({ error: "Credenciales inválidas" });
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
  const logger = require('../utils/logger');
  logger.error(`[login] Contraseña incorrecta para email: ${email}`);
        return res.status(400).json({ error: "Credenciales inválidas" });
      }

      const payload = buildSessionPayload(user);
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      const publico = await Usuario.findPublicById(user.id);
      res.json({ mensaje: "Login exitoso", usuario: publico, token });
    } catch (e) {
  const logger = require('../utils/logger');
  logger.error("[login] Error inesperado:", e);
      res.status(500).json({ error: "Error en el login" });
    }
  },

  me: async (req, res) => {
    try {
      // req.user viene del token (sesión personalizada)
      const data = await Usuario.findPublicById(req.user.id);
      res.json({ me: data, session: req.user });
    } catch (e) {
      res.status(500).json({ error: "Error obteniendo perfil" });
    }
  }
    ,
    // Consultar disponibilidad de staff
    disponibilidadStaff: async (req, res) => {
      try {
        const staffId = req.params.staffId;
        const { desde, hasta } = req.query;
        if (!staffId || !desde || !hasta) {
          return res.status(400).json({ error: "Faltan parámetros staffId, desde, hasta" });
        }
        const { getStaffDisponibilidad } = require("../utils/disponibilidadStaff");
        const desdeDate = new Date(desde);
        const hastaDate = new Date(hasta);
        const disponibilidad = await getStaffDisponibilidad(staffId, desdeDate, hastaDate);
        res.json({ disponibilidad });
      } catch (e) {
  const logger = require('../utils/logger');
  logger.error(e);
        res.status(500).json({ error: "Error consultando disponibilidad" });
      }
    }
    ,
    // Cambio de contraseña seguro
    changePassword: async (req, res) => {
      try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
          return res.status(400).json({ error: "Debes enviar oldPassword y newPassword" });
        }
        const user = await Usuario.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
        const ok = await bcrypt.compare(oldPassword, user.password);
        if (!ok) return res.status(400).json({ error: "La contraseña actual es incorrecta" });
        if (oldPassword === newPassword) {
          return res.status(400).json({ error: "La nueva contraseña debe ser diferente" });
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        await Usuario.updatePassword(user.id, hashed);
        res.json({ mensaje: "Contraseña actualizada correctamente" });
      } catch (e) {
  const logger = require('../utils/logger');
  logger.error(e);
        res.status(500).json({ error: "Error al cambiar la contraseña" });
      }
    }
};

module.exports = authController;
