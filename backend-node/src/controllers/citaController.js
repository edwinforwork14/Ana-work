// Obtener una cita y sus documentos asociados
const pool = require('../config/db');
// src/controllers/citaController.js
const Cita = require('../models/Cita');
const { citaSchema } = require("./schemas");
const Notificacion = require("../models/Notificacion");
const { format } = require('date-fns');
const { es } = require('date-fns/locale');

// Helper para resolver nombres legibles para notificaciones.
// Prioriza: req.user.nombre -> lookup por req.user.id -> lookup por fallbackUserId -> roleFallback
async function getDisplayName(req, fallbackUserId, roleFallback = 'Usuario') {
  try {
    if (req && req.user && req.user.nombre) return req.user.nombre;
    const userId = req && req.user && req.user.id ? req.user.id : null;
    if (userId) {
      const r = await pool.query('SELECT nombre FROM usuarios WHERE id = $1', [userId]);
      if (r.rows[0] && r.rows[0].nombre) return r.rows[0].nombre;
    }
    if (fallbackUserId) {
      const r2 = await pool.query('SELECT nombre FROM usuarios WHERE id = $1', [fallbackUserId]);
      if (r2.rows[0] && r2.rows[0].nombre) return r2.rows[0].nombre;
    }
  } catch (e) {
    // si falla la consulta, seguimos al fallback
  }
  // último recurso: email del req.user o label por rol
  if (req && req.user && req.user.email) return req.user.email;
  return roleFallback;
}


const obtenerCitaConDocumentos = async (req, res) => {
  try {
    const id = req.params.id;
    // Traer la cita
    const citaResult = await pool.query('SELECT * FROM citas WHERE id = $1', [id]);
    if (citaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }
    const cita = citaResult.rows[0];
    // Traer los documentos asociados
    const docResult = await pool.query('SELECT * FROM documentos WHERE id_cita = $1', [id]);
    cita.documentos = docResult.rows;
    res.json({ cita });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cita y documentos', details: err.message });
  }
};



// Obtener todas las citas de un usuario específico (solo staff y admin)
exports.getCitasByUsuario = async (req, res) => {
  try {
    const citas = await Cita.findAllByUsuario(req.params.id);
    res.json(citas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Obtener todas las citas del usuario autenticado
exports.getAllCitas = async (req, res) => {
  try {
    // 1. Actualizar citas confirmadas y pasadas a completada
    const now = new Date();
    await Cita.marcarCompletadasAutomatico(now);

    let citas;
    const estado = req.query.estado;
    if (req.user.rol === 'admin') {
      citas = await Cita.findAll();
      if (estado && estado !== 'todas') {
        citas = citas.filter(c => c.estado === estado);
      }
    } else if (req.user.rol === 'staff') {
      citas = await Cita.findAllByStaffAndEstado(req.user.id, estado);
    } else {
      if (estado && estado !== 'todas') {
        citas = (await Cita.findAllByUsuario(req.user.id)).filter(c => c.estado === estado);
      } else {
        citas = await Cita.findAllByUsuario(req.user.id);
      }
    }
    res.json(citas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener una cita por ID (solo si pertenece al usuario)
exports.getCitaById = async (req, res) => {
  try {
    const cita = await Cita.findById(req.params.id);
    if (!cita) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }
    // La lógica de permisos se maneja en permissionMiddleware.js
    return res.json(cita);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar una cita (solo si pertenece al usuario)
exports.updateCita = async (req, res) => {
  try {
    const cita = await Cita.findById(req.params.id);
    if (!cita) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }
    let data;
    // La lógica de permisos y validación de estado se maneja en permissionMiddleware.js
    if (req.originalUrl.endsWith('/cancelar')) {
      data = { estado: 'cancelada' };
  const nombreCreador = await getDisplayName(req, cita.id_usuario, 'Usuario');
      // Notificación para el staff (si la acción la realiza el cliente)
      if (req.user.rol === 'cliente') {
        await Notificacion.crear({
          id_usuario: cita.id_usuario,
          id_staff: cita.id_staff,
          id_cita: cita.id,
          tipo: "cita_cancelada",
          mensaje: `La cita (ID: ${cita.id}) fue cancelada por ${nombreCreador}. Duración: ${cita.duracion || 60} minutos.`,
          from: 'cliente'
        });
      }
      // Notificación para el cliente (si la acción la realiza el staff)
      if (req.user.rol === 'staff') {
        const nombreStaff = await getDisplayName(req, cita.id_staff, 'Staff');
        await Notificacion.crear({
          id_usuario: cita.id_usuario,
          id_staff: cita.id_staff,
          id_cita: cita.id,
          tipo: "cita_cancelada_cliente",
          mensaje: `Tu cita (ID: ${cita.id}) fue cancelada por el staff ${nombreStaff}. Duración: ${cita.duracion || 60} minutos.`,
          from: 'staff'
        });
      }
    } else if (req.originalUrl.endsWith('/completar')) {
      data = { estado: 'completada' };
      // Notificación para el cliente si la acción la realiza el staff
      if (req.user.rol === 'staff') {
        const nombreStaff = await getDisplayName(req, cita.id_staff, 'Staff');
        await Notificacion.crear({
          id_usuario: cita.id_usuario,
          id_staff: cita.id_staff,
          id_cita: cita.id,
          tipo: "cita_completada_cliente",
          mensaje: `Tu cita (ID: ${cita.id}) fue completada por el staff ${nombreStaff}. Duración: ${cita.duracion || 60} minutos.`,
          from: 'staff'
        });
      }
    } else if (req.originalUrl.endsWith('/pendiente')) {
      data = { estado: 'pendiente' };
      // Notificación para el cliente si la acción la realiza el staff
      if (req.user.rol === 'staff') {
        const nombreStaff = await getDisplayName(req, cita.id_staff, 'Staff');
        await Notificacion.crear({
          id_usuario: cita.id_usuario,
          id_staff: cita.id_staff,
          id_cita: cita.id,
          tipo: "cita_pendiente_cliente",
          mensaje: `Tu cita (ID: ${cita.id}) fue marcada como pendiente por el staff ${nombreStaff}. Duración: ${cita.duracion || 60} minutos.`,
          from: 'staff'
        });
      }
    } else if (req.user.rol === 'cliente') {
      data = { ...req.body };
      if ('estado' in data) {
        delete data.estado;
      }
      if ('id_staff' in data) {
        delete data.id_staff;
      }
    } else if (req.user.rol === 'admin') {
      data = { estado: req.body.estado };
    } else if (req.user.rol === 'staff') {
      data = { estado: req.body.estado };
    }

    // Notificación de reagendamiento si cambia estado, fecha o hora
    const cambioMotivo = req.body.motivo && req.body.motivo !== cita.motivo;
    const cambioFecha = req.body.fecha && req.body.fecha !== cita.fecha;
    const cambioHora = req.body.hora && req.body.hora !== cita.hora;
    if (cambioMotivo || cambioFecha || cambioHora) {
  // Obtener nombre legible del creador de la cita
  const nombreCreador = await getDisplayName(req, cita.id_usuario, 'Usuario');
      let mensaje = `La cita (ID: ${cita.id}) de ${nombreCreador} fue `;
  if (cambioMotivo) mensaje += `modificada en el motivo. `;
  if (cambioFecha) mensaje += `Nueva fecha: ${req.body.fecha}. `;
  if (cambioHora) mensaje += `Nueva hora: ${req.body.hora}. `;
  mensaje += `Duración: ${(req.body.duracion || cita.duracion || 60)} minutos.`;
      const notifData = {
        id_usuario: cita.id_usuario, // El cliente es el usuario de la cita
        id_staff: cita.id_staff,
        id_cita: cita.id,
        tipo: "cita_reagendada",
  mensaje: mensaje.trim(),
        from: req.user.rol === 'staff' ? 'staff' : 'cliente'
      };
  require('../utils/logger').debug('Notificacion.crear', notifData);
  await Notificacion.crear(notifData);
    }

    const updated = await Cita.update(req.params.id, data);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Eliminar una cita (solo si pertenece al usuario)
exports.deleteCita = async (req, res) => {
  try {
    const cita = await Cita.findById(req.params.id);
    if (!cita) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }
    // El cliente solo puede eliminar su propia cita
    if (req.user.rol === 'cliente' && cita.id_usuario !== req.user.id) {
      return res.status(403).json({ error: "No tienes permiso para eliminar esta cita" });
    }
    // Admin y staff pueden eliminar cualquier cita
    await Cita.delete(req.params.id);
    res.json({ mensaje: "Cita eliminada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.createCita = async (req, res) => {
  try {
    // El id_usuario siempre es el del usuario autenticado
    let data = { ...req.body, id_usuario: req.user.id };
    const result = await Cita.create(data);
    if (result && result.success) {
      // Crear notificación para el staff asignado (enlazando usuario, staff y cita)
      const nombreCreador = await getDisplayName(req, result.cita.id_usuario || result.cita.id || req.user.id, 'Usuario');

      await Notificacion.crear({
        id_usuario: req.user.id, // el cliente
        id_staff: req.body.id_staff,
        id_cita: result.cita.id,
        tipo: "cita_nueva",
  mensaje: `Nueva cita agendada por ${nombreCreador} para ${req.body.fecha || req.body.fecha_hora_utc}. Duración: ${(req.body.duracion || 60)} minutos.`,
        from: req.user.rol === 'staff' ? 'staff' : 'cliente'
      });
      res.status(201).json({ cita: result.cita, mensaje: result.mensaje || "Cita agendada exitosamente", success: true });
    } else if (result && result.error) {
      res.status(400).json({ error: result.error, success: false });
    } else {
      res.status(400).json({ error: "No se pudo crear la cita", success: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message || "Error interno al agendar la cita", success: false });
  }
};



// Confirmar cita (solo staff y admin)
exports.confirmarCita = async (req, res) => {
  try {
    const result = await Cita.confirmarCita(req.params.id);
    if (result.success) {
      // Crear notificación para el cliente cuando la cita es confirmada
      const cita = result.cita;
      // Formatear fecha en español y simplificar hora
      let fechaStr = '';
      try {
        const d = new Date(cita.fecha);
        // ejemplo: 'miércoles 22 de octubre de 2025 a las 13:00'
        fechaStr = format(d, "EEEE d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
        // capitalizar primera letra
        fechaStr = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1);
      } catch (e) {
        fechaStr = cita.fecha;
      }

      await Notificacion.crear({
        id_usuario: cita.id_usuario,
        id_staff: cita.id_staff,
        id_cita: cita.id,
        tipo: "cita_confirmada_cliente",
        mensaje: `Tu cita para el ${fechaStr} ha sido confirmada por el staff ${req.user.nombre || 'Staff'}. Duración: ${cita.duracion || 60} minutos.`,
        from: 'staff'
      });
      res.json({ cita: result.cita, mensaje: result.mensaje, success: true });
    } else {
      res.status(400).json({ error: result.error, success: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message, success: false });
  }
};

module.exports = {
  obtenerCitaConDocumentos,
  getCitasByUsuario: exports.getCitasByUsuario,
  getAllCitas: exports.getAllCitas,
  getCitaById: exports.getCitaById,
  updateCita: exports.updateCita,
  deleteCita: exports.deleteCita,
  createCita: exports.createCita,
  confirmarCita: exports.confirmarCita,
  // Agrega aquí otros métodos si los tienes
};