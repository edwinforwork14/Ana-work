// authRoutes.js
// Rutas de autenticación
const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const { authMiddleware, authorize } = require("../middlewares/authMiddleware");

// públicas
router.post("/register", auth.register);
router.post("/login", auth.login);

// Consultar disponibilidad del staff (admin y cliente pueden ver)
router.get("/disponibilidad-staff/:staffId", authMiddleware, auth.disponibilidadStaff);

// Obtener todos los usuarios con rol staff
const Usuario = require("../models/Usuario");
router.get("/staffs", async (req, res) => {
  try {
    const staffs = await Usuario.getStaffs();
    res.json({ staffs });
  } catch (e) {
    res.status(500).json({ error: "Error al obtener staffs" });
  }
});

// protegidas (ejemplo: ver perfil)
router.get("/me", authMiddleware, auth.me);

// Ruta protegida para cambio de contraseña
router.post("/change-password", authMiddleware, auth.changePassword);

// ejemplo de ruta solo para staff, admin y cliente no puede actualizar el estado de la cita solo reagendar cita
router.get("/solo-staff", authMiddleware, authorize(["staff", "admin"]), (req, res) => {
  res.json({ ok: true, msg: "Contenido para staff/admin" });
});

// ejemplo de ruta solo admin
router.delete("/solo-admin", authMiddleware, authorize(["admin"]), (req, res) => {
  res.json({ ok: true, msg: "Acción administrativa" });
});

module.exports = router;
