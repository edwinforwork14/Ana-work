// authController.js
// Controlador para autenticación
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/auth");

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
      console.error(e);
      res.status(500).json({ error: "Error en el registro" });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await Usuario.findByEmail(email);
      if (!user) return res.status(400).json({ error: "Credenciales inválidas" });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(400).json({ error: "Credenciales inválidas" });

      const payload = buildSessionPayload(user);
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      const publico = await Usuario.findPublicById(user.id);
      res.json({ mensaje: "Login exitoso", usuario: publico, token });
    } catch (e) {
      console.error(e);
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
};

module.exports = authController;
