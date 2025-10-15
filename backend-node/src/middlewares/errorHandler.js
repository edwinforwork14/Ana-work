// errorHandler.js
// Middleware para manejo centralizado de errores Express
// Uso: al final del stack de middlewares: app.use(require('./middlewares/errorHandler'))

const logger = require('../utils/logger');

// Handler de errores central. Asegura una respuesta JSON consistente.
module.exports = (err, req, res, next) => {
  // Loguear stack (logger.error siempre imprime)
  logger.error(err && err.stack ? err.stack : String(err));

  // Si la respuesta ya fue enviada, delegar a Express
  if (res.headersSent) return next(err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).json({ error: message, success: false });
};
 
