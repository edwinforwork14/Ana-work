// db.js
// Configuración de la conexión a PostgreSQL
const { Pool } = require('pg');

const pool = new Pool({
  user: 'citas_user',
  host: 'localhost',
  database: 'citas_app',
  password: '123456789',
  port: 5432,
});

pool.connect()
  .then(() => console.log("✅ Conectado a PostgreSQL"))
  .catch(err => console.error("❌ Error al conectar a PostgreSQL", err));

module.exports = pool;
