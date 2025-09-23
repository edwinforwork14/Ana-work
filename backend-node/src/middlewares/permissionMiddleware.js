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

module.exports = { allowRoles, onlyOwnStaffCita, onlyOwnClienteCita, onlyAdmin };
