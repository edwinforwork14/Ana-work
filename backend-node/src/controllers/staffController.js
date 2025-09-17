// src/controllers/staffController.js
const Cita = require('../models/Cita');

exports.getDisponibilidadStaff = async (req, res) => {
  const { persona_asignada_id } = req.query;
  if (!persona_asignada_id || isNaN(Number(persona_asignada_id))) {
    return res.status(400).json({ error: 'Parámetro persona_asignada_id inválido o faltante' });
  }
  try {
    // Solo citas confirmadas
    const ocupados = await Cita.getStaffOcupadoConfirmadas(persona_asignada_id);
    res.json({ ocupados });
  } catch (error) {
    res.status(500).json({ error: 'Error consultando disponibilidad' });
  }
};