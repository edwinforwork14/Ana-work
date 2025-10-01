const Notificacion = require("../models/Notificacion");

exports.listar = async (req, res) => {
  try {
    // Admin puede ver todas las notificaciones
    if (req.user.rol === 'admin') {
      const id_staff = req.query.id_staff;
      const notifs = await Notificacion.listarTodas(id_staff);
      return res.json(notifs);
    }
    // Si existe filtro de notificaciones, usarlo
    if (req.notifFilter && req.notifFilter.remitenteIds) {
      const notifs = await Notificacion.listarPorRemitentes(req.notifFilter.remitenteIds, req.user.id, req.user.rol);
      return res.json(notifs);
    }
    // Fallback: mostrar notificaciones propias (solo si no hay filtro)
    const notifs = req.user.rol === 'staff'
      ? await Notificacion.listarPorStaff(req.user.id)
      : await Notificacion.listarPorUsuario(req.user.id);
    res.json(notifs);
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
