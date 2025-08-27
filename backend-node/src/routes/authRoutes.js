// authRoutes.js
// Rutas de autenticación
const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const { authMiddleware, authorize } = require("../middlewares/authMiddleware");
const { register } = require("../controllers/authController");

// públicas
router.post("/register", auth.register);
router.post("/login", auth.login);

// protegidas (ejemplo: ver perfil)
router.get("/me", authMiddleware, auth.me);

// ejemplo de ruta solo para staff y admin
router.get("/solo-staff", authMiddleware, authorize(["staff", "admin"]), (req, res) => {
  res.json({ ok: true, msg: "Contenido para staff/admin" });
});

// ejemplo de ruta solo admin
router.delete("/solo-admin", authMiddleware, authorize(["admin"]), (req, res) => {
  res.json({ ok: true, msg: "Acción administrativa" });
});

module.exports = router;
