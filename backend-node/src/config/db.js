// config/db.js
require("dotenv").config({ path: __dirname + "/../../.env" });
const { Pool } = require("pg");
const logger = require("../utils/logger");

// 🧠 Verificación de variables
if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  console.error("❌ Error: Faltan variables de entorno para la base de datos.");
  console.log({
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD ? "(oculta)" : undefined,
    DB_NAME: process.env.DB_NAME,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
  });
  process.exit(1);
}

// 🧩 Crear conexión forzando password como string
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD), // 👈 fuerza a string
  port: process.env.DB_PORT,
});

// 🧪 Probar conexión
pool
  .query("SELECT NOW()")
  .then(() => {
    logger.info("✅ Conectado a PostgreSQL");
  })
  .catch((err) => {
    logger.error("❌ Error al conectar a PostgreSQL", err);
  });

module.exports = pool;
