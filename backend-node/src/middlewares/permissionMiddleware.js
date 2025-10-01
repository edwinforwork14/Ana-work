// permissionMiddleware.js
// Middleware para controlar permisos CRUD según el rol

const allowRoles = (roles = []) => (req, res, next) => {
	if (!req.user || !roles.includes(req.user.rol)) {
		return res.status(403).json({ error: 'No tienes permiso para esta acción' });
	}
	next();
};

// Permite que solo el staff asignado pueda modificar la cita
const onlyOwnStaffCita = async (req, res, next) => {
	const Cita = require('../models/Cita');
	const cita = await Cita.findById(req.params.id);
	if (!cita) {
		return res.status(404).json({ error: 'Cita no encontrada' });
	}
	if (req.user.rol === 'staff' && cita.id_staff !== req.user.id) {
		return res.status(403).json({ error: 'No tienes permiso para modificar esta cita (staff)' });
	}
	next();
};

// Permite que solo el cliente dueño pueda modificar la cita
const onlyOwnClienteCita = async (req, res, next) => {
	const Cita = require('../models/Cita');
	const cita = await Cita.findById(req.params.id);
	if (!cita) {
		return res.status(404).json({ error: 'Cita no encontrada' });
	}
	if (req.user.rol === 'cliente' && cita.id_usuario !== req.user.id) {
		return res.status(403).json({ error: 'No tienes permiso para modificar esta cita (cliente)' });
	}
	next();
};

// Permite que solo admin pueda hacer cualquier acción (para rutas críticas)
const onlyAdmin = (req, res, next) => {
	if (!req.user || req.user.rol !== 'admin') {
		return res.status(403).json({ error: 'Solo el admin puede realizar esta acción' });
	}
	next();
};

// Permite ver la cita solo si eres admin, staff asignado o cliente dueño
const canViewCita = async (req, res, next) => {
  const Cita = require('../models/Cita');
  const cita = await Cita.findById(req.params.id);
  if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
  if (req.user.rol === 'admin') return next();
  if (req.user.rol === 'staff' && cita.id_staff === req.user.id) return next();
  if (req.user.rol === 'cliente' && cita.id_usuario === req.user.id) return next();
  return res.status(403).json({ error: 'No tienes permiso para ver esta cita' });
};

// Permite modificar la cita solo si eres admin, staff asignado o cliente dueño y la cita está pendiente
const canModifyCita = async (req, res, next) => {
  const Cita = require('../models/Cita');
  const cita = await Cita.findById(req.params.id);
  if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
  if (cita.estado !== 'pendiente') return res.status(403).json({ error: 'Solo puedes modificar una cita si está en estado pendiente' });
  if (req.user.rol === 'admin') return next();
  if (req.user.rol === 'staff' && cita.id_staff === req.user.id) return next();
  if (req.user.rol === 'cliente' && cita.id_usuario === req.user.id) return next();
  return res.status(403).json({ error: 'No tienes permiso para modificar esta cita' });
};

// Permite cancelar la cita solo si está pendiente y eres el dueño o staff asignado o admin
const canCancelCita = async (req, res, next) => {
  const Cita = require('../models/Cita');
  const cita = await Cita.findById(req.params.id);
  if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
  if (cita.estado !== 'pendiente') return res.status(403).json({ error: 'Solo puedes cancelar citas pendientes' });
  if (req.user.rol === 'admin') return next();
  if (req.user.rol === 'staff' && cita.id_staff === req.user.id) return next();
  if (req.user.rol === 'cliente' && cita.id_usuario === req.user.id) return next();
  return res.status(403).json({ error: 'No tienes permiso para cancelar esta cita' });
};

// Permite completar la cita solo si está confirmada y eres el staff asignado o admin
const canCompleteCita = async (req, res, next) => {
  const Cita = require('../models/Cita');
  const cita = await Cita.findById(req.params.id);
  if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
  if (cita.estado !== 'confirmada') return res.status(403).json({ error: 'Solo puedes completar citas confirmadas' });
  if (req.user.rol === 'admin') return next();
  if (req.user.rol === 'staff' && cita.id_staff === req.user.id) return next();
  return res.status(403).json({ error: 'No tienes permiso para completar esta cita' });
};

// Permite marcar como pendiente solo si la cita no está cancelada/completada y eres staff asignado o admin
const canMarkPendingCita = async (req, res, next) => {
  const Cita = require('../models/Cita');
  const cita = await Cita.findById(req.params.id);
  if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
  if (["completada", "cancelada"].includes(cita.estado)) return res.status(403).json({ error: 'No puedes volver a pendiente una cita completada o cancelada' });
  if (req.user.rol === 'admin') return next();
  if (req.user.rol === 'staff' && cita.id_staff === req.user.id) return next();
  return res.status(403).json({ error: 'No tienes permiso para marcar como pendiente esta cita' });
};

module.exports = {
  allowRoles,
  onlyOwnStaffCita,
  onlyOwnClienteCita,
  onlyAdmin,
  canViewCita,
  canModifyCita,
  canCancelCita,
  canCompleteCita,
  canMarkPendingCita
};