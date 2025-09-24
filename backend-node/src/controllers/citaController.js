// src/controllers/citaController.js
const Cita = require('../models/Cita');
const { citaSchema } = require("./schemas");
const Notificacion = require("../models/Notificacion");

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
    let citas;
    const estado = req.query.estado;
    if (req.user.rol === 'admin') {
      citas = await Cita.findAll();
      // Si se pasa estado, filtrar en memoria
      if (estado && estado !== 'todas') {
        citas = citas.filter(c => c.estado === estado);
      }
    } else if (req.user.rol === 'staff') {
      // staff solo ve sus propias citas asignadas
      citas = await Cita.findAllByStaffAndEstado(req.user.id, estado);
    } else {
      // cliente: filtrar por estado si se pasa
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
    // Admin puede ver cualquier cita
    if (req.user.rol === 'admin') {
      return res.json(cita);
    }
    // Staff solo puede ver citas donde es el staff asignado
    if (req.user.rol === 'staff') {
      if (cita.id_staff !== req.user.id) {
        return res.status(403).json({ error: "No tienes permiso para ver esta cita" });
      }
      return res.json(cita);
    }
    // Cliente solo puede ver su propia cita
    if (req.user.rol === 'cliente') {
      if (cita.id_usuario !== req.user.id) {
        return res.status(403).json({ error: "No tienes permiso para ver esta cita" });
      }
      return res.json(cita);
    }
    // Otros roles no pueden acceder
    return res.status(403).json({ error: "No tienes permiso para ver esta cita" });
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
    // Centralizar lógica de cambio de estado según la ruta
    if (req.originalUrl.endsWith('/cancelar')) {
      if (cita.estado !== 'pendiente') {
        return res.status(403).json({ error: "Solo puedes cancelar citas pendientes" });
      }
      data = { estado: 'cancelada' };
      // Notificación de cancelación para el staff
      const nombreCreador = req.user && req.user.nombre ? req.user.nombre : (cita.nombre_usuario || 'Usuario');
      await Notificacion.crear({
        id_usuario: cita.id_usuario,
        id_staff: cita.id_staff,
        id_cita: cita.id,
        tipo: "cita_cancelada",
        mensaje: `La cita (ID: ${cita.id}) fue cancelada por ${nombreCreador}.`
      });
    } else if (req.originalUrl.endsWith('/completar')) {
      if (cita.estado !== 'confirmada') {
        return res.status(403).json({ error: "Solo puedes completar citas confirmadas" });
      }
      data = { estado: 'completada' };
    } else if (req.originalUrl.endsWith('/pendiente')) {
      if (["completada", "cancelada"].includes(cita.estado)) {
        return res.status(403).json({ error: "No puedes volver a pendiente una cita completada o cancelada" });
      }
      data = { estado: 'pendiente' };
    } else if (req.user.rol === 'cliente') {
      // El cliente solo puede modificar su propia cita si está en pendiente
      if (cita.id_usuario !== req.user.id) {
        return res.status(403).json({ error: "No tienes permiso para modificar esta cita" });
      }
      if (cita.estado !== 'pendiente') {
        return res.status(403).json({ error: "Solo puedes modificar una cita si está en estado pendiente" });
      }
      data = { ...req.body };
      if ('estado' in data) {
        delete data.estado;
      }
      if ('id_staff' in data) {
        delete data.id_staff;
      }
    } else if (req.user.rol === 'admin') {
      // Admin puede modificar cualquier cita
      data = { estado: req.body.estado };
    } else if (req.user.rol === 'staff') {
      // Staff solo puede modificar citas que le pertenecen
      if (cita.id_staff !== req.user.id) {
        return res.status(403).json({ error: "No tienes permiso para modificar esta cita" });
      }
      data = { estado: req.body.estado };
    }

    // Notificación de reagendamiento si cambia estado, fecha o hora
    const cambioMotivo = req.body.motivo && req.body.motivo !== cita.motivo;
    const cambioFecha = req.body.fecha && req.body.fecha !== cita.fecha;
    const cambioHora = req.body.hora && req.body.hora !== cita.hora;
    if (cambioMotivo || cambioFecha || cambioHora) {
      // Obtener nombre del usuario creador de la cita
      const nombreCreador = req.user && req.user.nombre ? req.user.nombre : (cita.nombre_usuario || 'Usuario');
      let mensaje = `La cita (ID: ${cita.id}) de ${nombreCreador} fue `;
      if (cambioMotivo) mensaje += `modificada en el motivo. `;
      if (cambioFecha) mensaje += `Nueva fecha: ${req.body.fecha}. `;
      if (cambioHora) mensaje += `Nueva hora: ${req.body.hora}.`;
      const notifData = {
        id_usuario: cita.id_usuario, // El cliente es el usuario de la cita
        id_staff: cita.id_staff,
        id_cita: cita.id,
        tipo: "cita_reagendada",
        mensaje: mensaje.trim()
      };
      console.log('Notificacion.crear', notifData);
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
  // Validar datos de entrada
  const { error } = citaSchema.validate(req.body);
  if (error) {
    const customMsg = error.details[0].context && error.details[0].context.message;
    return res.status(400).json({ error: customMsg || error.details[0].message, success: false });
  }
  try {
    let data = { ...req.body, id_usuario: req.user.id };
    if (req.user.rol === 'cliente') {
      if ('estado' in data) {
        delete data.estado;
      }
    }
    const result = await Cita.create(data);
    if (result && result.success) {
      // Crear notificación para el staff asignado (enlazando usuario, staff y cita)
      const nombreCreador = req.user && req.user.nombre ? req.user.nombre : (result.cita.nombre_usuario || 'Usuario');
      await Notificacion.crear({
        id_usuario: req.user.id, // el cliente
        id_staff: req.body.id_staff,
        id_cita: result.cita.id,
        tipo: "cita_nueva",
        mensaje: `Nueva cita agendada por ${nombreCreador} para ${req.body.fecha}`
      });

      // Ya no se crea notificación de alerta_pendiente para citas pendientes
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
      res.json({ cita: result.cita, mensaje: result.mensaje, success: true });
    } else {
      res.status(400).json({ error: result.error, success: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message, success: false });
  }
};