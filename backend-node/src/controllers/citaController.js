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
      // El cliente solo puede modificar su propia cita y no el estado
      if (cita.id_usuario !== req.user.id) {
        return res.status(403).json({ error: "No tienes permiso para modificar esta cita" });
      }
      if ('estado' in data) {
        delete data.estado;
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
// src/controllers/citaController.js
const Cita = require('../models/Cita');

exports.createCita = async (req, res) => {
  try {
  // id_usuario viene del token JWT
  const data = { ...req.body, id_usuario: req.user.id };
  const cita = await Cita.create(data);
    res.status(201).json(cita);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};