// Obtener todas las citas del usuario autenticado
exports.getAllCitas = async (req, res) => {
  try {
    const citas = await Cita.findAllByCliente(req.user.id);
    res.json(citas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener una cita por ID (solo si pertenece al usuario)
exports.getCitaById = async (req, res) => {
  try {
    const cita = await Cita.findById(req.params.id);
    if (!cita || cita.cliente_id !== req.user.id) {
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
    if (!cita || cita.cliente_id !== req.user.id) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }
    const updated = await Cita.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Eliminar una cita (solo si pertenece al usuario)
exports.deleteCita = async (req, res) => {
  try {
    const cita = await Cita.findById(req.params.id);
    if (!cita || cita.cliente_id !== req.user.id) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }
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
  // cliente_id viene del token JWT
  const data = { ...req.body, cliente_id: req.user.id };
  const cita = await Cita.create(data);
    res.status(201).json(cita);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};