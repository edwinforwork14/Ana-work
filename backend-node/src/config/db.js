// Configuración de la conexión a PostgreSQL
require("dotenv").config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Opcional: mensaje de conexión exitosa solo para desarrollo
pool.query('SELECT NOW()')
  .then(() => {
    const logger = require('../utils/logger');
    logger.info('✅ Conectado a PostgreSQL');
  })
  .catch(err => {
    const logger = require('../utils/logger');
    logger.error('❌ Error al conectar a PostgreSQL', err);
  });

module.exports = pool;