// permissionMiddleware.js
// Middleware para controlar permisos CRUD según el rol

const allowRoles = (roles = []) => (req, res, next) => {
	if (!req.user || !roles.includes(req.user.rol)) {
		return res.status(403).json({ error: 'No tienes permiso para esta acción' });
	}
	next();
};

module.exports = { allowRoles };
