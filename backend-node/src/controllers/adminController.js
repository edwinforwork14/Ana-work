// controllers/adminController.js
const pool = require('../config/db');
const logger = require('../utils/logger');

// ======================================================
// 🧠 Obtener historial completo de un usuario (cliente o staff)
// GET /api/admin/usuarios/:id/historial
// ======================================================
exports.getUsuarioHistorial = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Falta el parámetro id del usuario" });

    // Verificar si existe el usuario
    const user = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    if (user.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

    const usuario = user.rows[0];

    const citas = await pool.query(`
      SELECT * FROM citas 
      WHERE id_usuario = $1 OR id_staff = $1
      ORDER BY fecha DESC
    `, [id]);

    const documentos = await pool.query(`
      SELECT d.id, d.nombre, d.creado_en, d.id_cita, d.id_usuario, d.mime_type
      FROM documentos d
      JOIN citas c ON c.id = d.id_cita
      WHERE c.id_usuario = $1 OR c.id_staff = $1
      ORDER BY d.creado_en DESC
    `, [id]);

    const notificaciones = await pool.query(`
      SELECT * FROM notificaciones 
      WHERE id_usuario = $1 OR id_staff = $1
      ORDER BY creada_en DESC
    `, [id]);

    const historial = [
      ...citas.rows.map(c => ({ tipo: 'cita', fecha: c.fecha, data: c })),
      ...documentos.rows.map(d => ({ tipo: 'documento', fecha: d.creado_en, data: d })),
      ...notificaciones.rows.map(n => ({ tipo: 'notificacion', fecha: n.creada_en, data: n })),
    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    res.json({
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
      historial
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ======================================================
// 🗑️ Eliminar usuario o staff con dependencias
// DELETE /api/admin/usuarios/:id
// ======================================================
exports.deleteUsuario = async (req, res) => {
  const client = await pool.connect();
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Falta el id de usuario" });

    await client.query('BEGIN');

    const user = await client.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    if (user.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Eliminar notificaciones
    await client.query('DELETE FROM notificaciones WHERE id_usuario = $1 OR id_staff = $1', [id]);

    // Eliminar documentos relacionados con sus citas
    await client.query(`
      DELETE FROM documentos 
      WHERE id_cita IN (SELECT id FROM citas WHERE id_usuario = $1 OR id_staff = $1)
    `, [id]);

    // Eliminar citas
    await client.query('DELETE FROM citas WHERE id_usuario = $1 OR id_staff = $1', [id]);

    // Eliminar usuario
    await client.query('DELETE FROM usuarios WHERE id = $1', [id]);

    await client.query('COMMIT');
    res.json({ mensaje: `Usuario ${user.rows[0].nombre} eliminado correctamente junto con sus datos.` });
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// ======================================================
// 👥 Listar usuarios
// GET /api/admin/usuarios?rol=staff|cliente|admin
// ======================================================
exports.listUsuarios = async (req, res) => {
  try {
    const { rol } = req.query;
    let q = 'SELECT id, nombre, email, rol, telefono FROM usuarios';
    const params = [];
    if (rol) {
      q += ' WHERE rol = $1';
      params.push(rol);
    }
    q += ' ORDER BY id ASC';
    const result = await pool.query(q, params);
    res.json({ usuarios: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======================================================
// 📊 Obtener métricas del panel admin
// GET /api/admin/panel?period=day|week|month&fecha=YYYY-MM-DD&id_staff=
// ======================================================
exports.getAdminPanelMetrics = async (req, res) => {
  try {
    const { period = 'day', fecha, id_staff } = req.query;
    const base = fecha ? new Date(fecha) : new Date();
    const start = new Date(base);
    const end = new Date(base);

    if (period === 'week') {
      start.setDate(base.getDate() - base.getDay());
      end.setDate(start.getDate() + 6);
    } else if (period === 'month') {
      start.setDate(1);
      end.setMonth(base.getMonth() + 1);
      end.setDate(0);
    }

    const citasQuery = `
      SELECT estado, COUNT(*) FROM citas
      WHERE fecha BETWEEN $1 AND $2
      ${id_staff ? 'AND id_staff = $3' : ''}
      GROUP BY estado
    `;
    const citasParams = id_staff ? [start, end, id_staff] : [start, end];
    const estados = await pool.query(citasQuery, citasParams);

    const totalCitas = estados.rows.reduce((acc, r) => acc + Number(r.count), 0);
    const estadosObj = {};
    estados.rows.forEach(r => estadosObj[r.estado] = Number(r.count));

    const totalDocs = await pool.query('SELECT COUNT(*) FROM documentos');
    res.json({
      period,
      start,
      end,
      totalCitas,
      estados: estadosObj,
      totalDocumentos: Number(totalDocs.rows[0].count)
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ======================================================
// 📅 Listar citas (filtros opcionales)
// GET /api/admin/citas
// ======================================================
exports.listAllCitas = async (req, res) => {
  try {
    const { desde, hasta, id_usuario, id_staff, estado } = req.query;
    let q = 'SELECT * FROM citas WHERE 1=1';
    const params = [];

    if (desde) { params.push(desde); q += ` AND DATE(fecha) >= $${params.length}`; }
    if (hasta) { params.push(hasta); q += ` AND DATE(fecha) <= $${params.length}`; }
    if (id_usuario) { params.push(id_usuario); q += ` AND id_usuario = $${params.length}`; }
    if (id_staff) { params.push(id_staff); q += ` AND id_staff = $${params.length}`; }
    if (estado) { params.push(estado); q += ` AND estado = $${params.length}`; }

    q += ' ORDER BY fecha DESC';
    const result = await pool.query(q, params);
    res.json({ citas: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======================================================
// 📂 Listar citas con documentos
// GET /api/admin/citas/con-documentos
// ======================================================
exports.listCitasWithDocumentos = async (req, res) => {
  try {
    const { desde, hasta, id_usuario, id_staff } = req.query;
    let q = `
      SELECT c.*, d.id AS documento_id, d.nombre AS documento_nombre, d.creado_en
      FROM citas c
      JOIN documentos d ON c.id = d.id_cita
      WHERE 1=1
    `;
    const params = [];
    if (desde) { params.push(desde); q += ` AND DATE(c.fecha) >= $${params.length}`; }
    if (hasta) { params.push(hasta); q += ` AND DATE(c.fecha) <= $${params.length}`; }
    if (id_usuario) { params.push(id_usuario); q += ` AND c.id_usuario = $${params.length}`; }
    if (id_staff) { params.push(id_staff); q += ` AND c.id_staff = $${params.length}`; }

    q += ' ORDER BY c.fecha DESC';
    const result = await pool.query(q, params);
    res.json({ citas: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======================================================
// 🧾 Historial de cliente (rango de fechas sin horas)
// GET /api/admin/clientes/:id/historial?desde=&hasta=
// ======================================================
exports.getClienteHistorial = async (req, res) => {
  try {
    const { id } = req.params;
    const { desde, hasta } = req.query;
    const limit = 200;

    if (!id) return res.status(400).json({ error: "Falta el parámetro id" });

    const desdeDate = desde ? new Date(desde + 'T00:00:00') : new Date('2000-01-01');
    const hastaDate = hasta ? new Date(hasta + 'T23:59:59') : new Date();

    const citas = await pool.query(`
      SELECT * FROM citas 
      WHERE (id_usuario = $1 OR id_staff = $1)
      AND fecha BETWEEN $2 AND $3
      ORDER BY fecha DESC
    `, [id, desdeDate, hastaDate]);

    const documentos = await pool.query(`
      SELECT d.id, d.nombre, d.creado_en, d.id_cita, d.id_usuario, d.mime_type
      FROM documentos d
      JOIN citas c ON c.id = d.id_cita
      WHERE (c.id_usuario = $1 OR c.id_staff = $1)
      AND c.fecha BETWEEN $2 AND $3
      ORDER BY d.creado_en DESC
    `, [id, desdeDate, hastaDate]);

    const notificaciones = await pool.query(`
      SELECT * FROM notificaciones
      WHERE (id_usuario = $1 OR id_staff = $1)
      AND creada_en BETWEEN $2 AND $3
      ORDER BY creada_en DESC
    `, [id, desdeDate, hastaDate]);

    const historial = [
      ...citas.rows.map(c => ({ tipo: 'cita', fecha: c.fecha, data: c })),
      ...documentos.rows.map(d => ({ tipo: 'documento', fecha: d.creado_en, data: d })),
      ...notificaciones.rows.map(n => ({ tipo: 'notificacion', fecha: n.creada_en, data: n })),
    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, limit);

    res.json({
      filtros: { desde, hasta },
      totalCitas: citas.rowCount,
      totalDocumentos: documentos.rowCount,
      totalNotificaciones: notificaciones.rowCount,
      limite: limit,
      historial
    });
  } catch (err) {
    logger.error('❌ Error en getClienteHistorial:', err);
    res.status(500).json({ error: err.message });
  }
};


// ======================================================
// ✅ Exportación final
// ======================================================
module.exports = {
  getUsuarioHistorial: exports.getUsuarioHistorial,
  deleteUsuario: exports.deleteUsuario,
  listUsuarios: exports.listUsuarios,
  listAllCitas: exports.listAllCitas,
  listCitasWithDocumentos: exports.listCitasWithDocumentos,
  getClienteHistorial: exports.getClienteHistorial,
  getAdminPanelMetrics: exports.getAdminPanelMetrics
};
