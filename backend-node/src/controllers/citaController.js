// src/controllers/citaController.js
const Cita = require('../models/Cita');

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
    if (req.user.rol === 'admin' || req.user.rol === 'staff') {
      citas = await Cita.findAll();
    } else {
      citas = await Cita.findAllByUsuario(req.user.id);
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
  if (!cita || cita.id_usuario !== req.user.id) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }
    res.json(cita);
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
    let data = { ...req.body };
    if (req.user.rol === 'cliente') {
      // El cliente solo puede modificar su propia cita y no el estado ni persona_asignada_id
      if (cita.id_usuario !== req.user.id) {
        return res.status(403).json({ error: "No tienes permiso para modificar esta cita" });
      }
      if ('estado' in data) {
        delete data.estado;
      }
      if ('persona_asignada_id' in data) {
        delete data.persona_asignada_id;
      }
    } else if ((req.user.rol === 'admin' || req.user.rol === 'staff')) {
      // Admin y staff solo pueden modificar el estado
      data = { estado: data.estado };
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
    let data = { ...req.body, id_usuario: req.user.id };
    if (req.user.rol === 'cliente') {
      if ('persona_asignada_id' in data) {
        delete data.persona_asignada_id;
      }
      if ('estado' in data) {
        delete data.estado;
      }
    }
    const result = await Cita.create(data);
    if (result && result.success) {
      res.status(201).json({ cita: result.cita, mensaje: result.mensaje || "Cita agendada exitosamente", success: true });
    } else if (result && result.error) {
      res.status(429).json({ error: result.error, success: false });
    } else {
      res.status(400).json({ error: "No se pudo crear la cita", success: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message || "Error interno al agendar la cita", success: false });
  }
};