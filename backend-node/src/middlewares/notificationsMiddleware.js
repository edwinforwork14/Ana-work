// notificationsMiddleware.js
// Middlewares para filtrar notificaciones según reglas de negocio

const Cita = require('../models/Cita');
const Notificacion = require('../models/Notificacion');


// Middleware: solo staff puede ver notificaciones
const onlyStaffCanViewNotifications = (req, res, next) => {
  if (req.user.rol !== 'staff') {
    return res.status(403).json({ error: 'Solo el staff puede ver notificaciones.' });
  }
  next();
};

module.exports = {
  onlyStaffCanViewNotifications
};
