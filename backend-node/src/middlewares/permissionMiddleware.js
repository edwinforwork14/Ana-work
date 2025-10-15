// helper para envolver async middlewares y pasar errores a next()
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Permite ver un documento si eres admin, staff asignado a la cita, o cliente dueño
const canViewDocumento = asyncHandler(async (req, res, next) => {
  const pool = require('../config/db');
  // Buscar id_documento en params, query o body
  // Evitar leer propiedades de req.body si es undefined (p.ej. en GET sin body)
  const id_documento = req.params.id_documento || req.query.id_documento || (req.body && req.body.id_documento);
  const id_cita = req.query.id_cita || (req.body && req.body.id_cita);
  let doc = null;

  if (id_documento) {
    const result = await pool.query(
      'SELECT d.*, d.id_cita, c.id_staff, c.id_usuario FROM documentos d JOIN citas c ON d.id_cita = c.id WHERE d.id = $1',
      [id_documento]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Documento no encontrado' });
    doc = result.rows[0];
  } else if (id_cita) {
    // Si solo hay id_cita, buscar todos los documentos de esa cita (opcional)
    const result = await pool.query(
      'SELECT d.*, c.id_staff, c.id_usuario FROM documentos d JOIN citas c ON d.id_cita = c.id WHERE d.id_cita = $1',
      [id_cita]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Documento no encontrado' });
    doc = result.rows[0]; // O ajusta según tu lógica
  } else {
    return res.status(400).json({ error: 'Faltan parámetros para identificar el documento.' });
  }

  if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });
  if (req.user.rol === 'admin') return next();
  if (req.user.rol === 'staff' && doc.id_staff === req.user.id) return next();
  if (req.user.rol === 'cliente' && doc.id_usuario === req.user.id) return next();
  return res.status(403).json({ error: 'No tienes permiso para ver este documento' });
});

// Permite eliminar un documento si eres admin, staff asignado a la cita, o cliente dueño
const canDeleteDocumento = asyncHandler(async (req, res, next) => {
  const pool = require('../config/db');
  const { id_documento } = req.body;
  if (!id_documento) {
    return res.status(400).json({ error: 'Falta id_documento en el body.' });
  }
  const result = await pool.query('SELECT d.*, c.id_staff, c.id_usuario FROM documentos d JOIN citas c ON d.id_cita = c.id WHERE d.id = $1', [id_documento]);
  if (!result.rows.length) return res.status(404).json({ error: 'Documento no encontrado' });
  const doc = result.rows[0];
  if (req.user.rol === 'admin') return next();
  if (req.user.rol === 'staff' && doc.id_staff === req.user.id) return next();
  if (req.user.rol === 'cliente' && doc.id_usuario === req.user.id) return next();
  return res.status(403).json({ error: 'No tienes permiso para eliminar este documento' });
});
// Permite que el staff elimine solo sus propias citas asignadas (no confirmadas) y el cliente elimine sus propias citas (no confirmadas)
const canDeleteCita = asyncHandler(async (req, res, next) => {
  const Cita = require('../models/Cita');
  const cita = await Cita.findById(req.params.id);
  if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
  // Admin puede eliminar cualquier cita
  if (req.user.rol === 'admin') return next();
  // Staff solo puede eliminar citas asignadas a él y que no estén confirmadas
  if (req.user.rol === 'staff') {
    if (cita.id_staff !== req.user.id) {
      return res.status(403).json({ error: 'Solo puedes eliminar tus propias citas asignadas' });
    }
    if (cita.estado === 'confirmada') {
      return res.status(403).json({ error: 'No puedes eliminar una cita que ya está confirmada' });
    }
    return next();
  }
  // Cliente solo puede eliminar sus propias citas y que no estén confirmadas
  if (req.user.rol === 'cliente') {
    if (cita.id_usuario !== req.user.id) {
      return res.status(403).json({ error: 'Solo puedes eliminar tus propias citas' });
    }
    if (cita.estado === 'confirmada') {
      return res.status(403).json({ error: 'No puedes eliminar una cita que ya está confirmada' });
    }
    return next();
  }
  return res.status(403).json({ error: 'No tienes permiso para eliminar esta cita' });
});
// Middleware para validar reglas de negocio y permisos al crear cita
const validateCreateCita = (req, res, next) => {
  // Validar datos de entrada con el schema
  const { citaSchema } = require("../controllers/schemas");
  const { error } = citaSchema.validate(req.body);
  if (error) {
    const customMsg = error.details[0].context && error.details[0].context.message;
    return res.status(400).json({ error: customMsg || error.details[0].message, success: false });
  }
  // No permitir que el cliente envíe estado
  if (req.user.rol === 'cliente' && 'estado' in req.body) {
    delete req.body.estado;
  }
  next();
};
// Middleware para evitar agendar citas en el pasado (comparando en UTC)
const canCreateCita = (req, res, next) => {
  const { fecha_hora_utc } = req.body;
  if (!fecha_hora_utc) {
    return res.status(400).json({ error: 'La fecha y hora son requeridas para agendar la cita' });
  }
  const fechaHora = new Date(fecha_hora_utc);
  const ahora = new Date();
  if (fechaHora <= ahora) {
    return res.status(400).json({ error: 'Solo puedes agendar citas desde la hora actual en adelante' });
  }
  next();
};
// permissionMiddleware.js
// Middleware para controlar permisos CRUD según el rol

const allowRoles = (roles = []) => (req, res, next) => {
	if (!req.user || !roles.includes(req.user.rol)) {
		return res.status(403).json({ error: 'No tienes permiso para esta acción' });
	}
	next();
};

// Permite que solo el staff asignado pueda modificar la cita
const onlyOwnStaffCita = asyncHandler(async (req, res, next) => {
  const Cita = require('../models/Cita');
  const cita = await Cita.findById(req.params.id);
  if (!cita) {
    return res.status(404).json({ error: 'Cita no encontrada' });
  }
  if (req.user.rol === 'staff' && cita.id_staff !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para modificar esta cita (staff)' });
  }
  next();
});

// Permite que solo el cliente dueño pueda modificar la cita
const onlyOwnClienteCita = asyncHandler(async (req, res, next) => {
  const Cita = require('../models/Cita');
  const cita = await Cita.findById(req.params.id);
  if (!cita) {
    return res.status(404).json({ error: 'Cita no encontrada' });
  }
  if (req.user.rol === 'cliente' && cita.id_usuario !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para modificar esta cita (cliente)' });
  }
  next();
});

// Permite que solo admin pueda hacer cualquier acción (para rutas críticas)
const onlyAdmin = (req, res, next) => {
	if (!req.user || req.user.rol !== 'admin') {
		return res.status(403).json({ error: 'Solo el admin puede realizar esta acción' });
	}
	next();
};

// Permite ver la cita solo si eres admin, staff asignado o cliente dueño
const canViewCita = asyncHandler(async (req, res, next) => {
  const Cita = require('../models/Cita');
  const cita = await Cita.findById(req.params.id);
  if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
  if (req.user.rol === 'admin') return next();
  if (req.user.rol === 'staff' && cita.id_staff === req.user.id) return next();
  if (req.user.rol === 'cliente' && cita.id_usuario === req.user.id) return next();
  return res.status(403).json({ error: 'No tienes permiso para ver esta cita' });
});

// Permite modificar la cita solo si eres admin, staff asignado o cliente dueño y la cita está pendiente
const canModifyCita = asyncHandler(async (req, res, next) => {
  const Cita = require('../models/Cita');
  const cita = await Cita.findById(req.params.id);
  if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
  if (cita.estado !== 'pendiente') return res.status(403).json({ error: 'Solo puedes modificar una cita si está en estado pendiente' });
  if (req.user.rol === 'admin') return next();
  if (req.user.rol === 'staff' && cita.id_staff === req.user.id) return next();
  if (req.user.rol === 'cliente' && cita.id_usuario === req.user.id) return next();
  return res.status(403).json({ error: 'No tienes permiso para modificar esta cita' });
});

// Permite cancelar la cita solo si está pendiente y eres el dueño o staff asignado o admin
const canCancelCita = asyncHandler(async (req, res, next) => {
  const Cita = require('../models/Cita');
  const cita = await Cita.findById(req.params.id);
  if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
  if (cita.estado !== 'pendiente') return res.status(403).json({ error: 'Solo puedes cancelar citas pendientes' });
  if (req.user.rol === 'admin') return next();
  if (req.user.rol === 'staff' && cita.id_staff === req.user.id) return next();
  if (req.user.rol === 'cliente' && cita.id_usuario === req.user.id) return next();
  return res.status(403).json({ error: 'No tienes permiso para cancelar esta cita' });
});

// Permite completar la cita solo si está confirmada y eres el staff asignado o admin
const canCompleteCita = asyncHandler(async (req, res, next) => {
  const Cita = require('../models/Cita');
  const cita = await Cita.findById(req.params.id);
  if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
  if (cita.estado !== 'confirmada') return res.status(403).json({ error: 'Solo puedes completar citas confirmadas' });
  if (req.user.rol === 'admin') return next();
  if (req.user.rol === 'staff' && cita.id_staff === req.user.id) return next();
  return res.status(403).json({ error: 'No tienes permiso para completar esta cita' });
});

// Permite marcar como pendiente solo si la cita no está cancelada/completada y eres staff asignado o admin
const canMarkPendingCita = asyncHandler(async (req, res, next) => {
  const Cita = require('../models/Cita');
  const cita = await Cita.findById(req.params.id);
  if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
  if (["completada", "cancelada"].includes(cita.estado)) return res.status(403).json({ error: 'No puedes volver a pendiente una cita completada o cancelada' });
  if (req.user.rol === 'admin') return next();
  if (req.user.rol === 'staff' && cita.id_staff === req.user.id) return next();
  return res.status(403).json({ error: 'No tienes permiso para marcar como pendiente esta cita' });
});

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
  ,canCreateCita
  ,validateCreateCita
  ,canDeleteCita
  ,canViewDocumento
  ,canDeleteDocumento
};