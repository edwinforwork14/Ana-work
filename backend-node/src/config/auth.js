// auth.js
// Configuración de autenticación (puedes agregar JWT, etc.)
require("dotenv").config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || "dev_secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",
  COOKIE_SECURE: process.env.COOKIE_SECURE === "true",
};