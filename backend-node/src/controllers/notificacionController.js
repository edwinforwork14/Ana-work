const Notificacion = require("../models/Notificacion");

exports.listar = async (req, res) => {
  try {
    const id_staff = req.query.id_staff;
    if (req.user.rol === 'admin') {
      // Admin puede ver todas las notificaciones
      const notifs = await Notificacion.listarTodas(id_staff);
      res.json(notifs);
    } else {
      // Staff y cliente solo ven las suyas
      const notifs = await Notificacion.listarPorUsuario(req.user.id, id_staff);
      res.json(notifs);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.marcarLeida = async (req, res) => {
  try {
    const notif = await Notificacion.marcarLeida(req.params.id);
    res.json(notif);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
