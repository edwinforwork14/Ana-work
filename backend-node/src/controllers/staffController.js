const Usuario = require('../models/Usuario');
// Listar todos los usuarios con rol staff
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Usuario.getStaffs();
    res.json({ staff });
  } catch (err) {
    res.status(500).json({ error: 'Error consultando staff' });
  }
};
// Obtener citas de un usuario específico y estado
exports.getCitasByUsuarioAndEstado = async (req, res) => {
  const { id_usuario, estado } = req.query;
  if (!id_usuario || isNaN(Number(id_usuario))) {
    return res.status(400).json({ error: 'Parámetro id_usuario inválido o faltante' });
  }
  try {
    let q = 'SELECT * FROM citas WHERE id_usuario = $1';
    const params = [id_usuario];
    if (estado && estado !== 'todas') {
      q += ' AND estado = $2';
      params.push(estado);
    }
    const result = await require('../models/Cita').pool.query(q, params);
    res.json({ citas: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error consultando citas del usuario' });
  }
};
// src/controllers/staffController.js
const Cita = require('../models/Cita');

// Obtener citas de un staff por estado (staff solo ve las suyas, admin puede ver todas o filtrar por staff)
exports.getCitasByStaffAndEstado = async (req, res) => {
  let estado = req.query.estado;
  let id_staff = req.query.id_staff;
  try {
    if (req.user.rol === 'staff') {
      // staff solo ve sus propias citas, ignorar cualquier id_staff de la query
      const citas = await Cita.findAllByStaffAndEstado(req.user.id, estado);
      return res.json({ citas });
    } else if (req.user.rol === 'admin') {
      // admin puede ver todas o filtrar por staff
      if (id_staff) {
        const citas = await Cita.findAllByStaffAndEstado(id_staff, estado);
        return res.json({ citas });
      } else {
        // admin sin id_staff: ver todas las citas (sin filtrar por staff)
        const citas = await Cita.findAll();
        // Si se pasa estado, filtrar en memoria
        const citasFiltradas = estado && estado !== 'todas' ? citas.filter(c => c.estado === estado) : citas;
        return res.json({ citas: citasFiltradas });
      }
    } else {
      return res.status(403).json({ error: 'No autorizado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error consultando citas del staff' });
  }
};

exports.getDisponibilidadStaff = async (req, res) => {
  const { id_staff } = req.query;
  if (!id_staff || isNaN(Number(id_staff))) {
    return res.status(400).json({ error: 'Parámetro id_staff inválido o faltante' });
  }
  try {
    // Solo citas confirmadas
    const ocupados = await Cita.getStaffOcupadoConfirmadas(id_staff);
    res.json({ ocupados });
  } catch (error) {
    res.status(500).json({ error: 'Error consultando disponibilidad' });
  }
};