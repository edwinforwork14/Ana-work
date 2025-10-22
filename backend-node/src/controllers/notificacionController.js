const Notificacion = require("../models/Notificacion");
const pool = require("../config/db");

/**
 * Listar notificaciones según el rol y contexto del usuario.
 */
exports.listar = async (req, res) => {
  try {
    // Si es admin, puede ver todas las notificaciones (opcionalmente filtradas por staff)
    if (req.user.rol === "admin") {
      const id_staff = req.query.id_staff;
      const notifs = await Notificacion.listarTodas(id_staff);
      return res.json(notifs);
    }

    // Si hay filtro (por ejemplo, remitenteIds), usarlo
    if (req.notifFilter && req.notifFilter.remitenteIds) {
      const notifs = await Notificacion.listarPorRemitentes(
        req.notifFilter.remitenteIds,
        req.user.id,
        req.user.rol
      );
      return res.json(notifs);
    }

    // Por defecto: listar según el rol
    const notifs =
      req.user.rol === "staff"
        ? await Notificacion.listarPorStaff(req.user.id)
        : await Notificacion.listarPorUsuario(req.user.id);

    res.json(notifs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/**
 * Marca una notificación como leída.
 */
exports.marcarLeida = async (req, res) => {
  try {
    const notif = await Notificacion.marcarLeida(req.params.id);
    res.json(notif);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/**
 * Genera recordatorios automáticos para citas próximas.
 * Por defecto, busca entre 23.5h y 24.5h, pero se puede ajustar
 * con variables o query params (para pruebas).
 */
async function send24hReminders(customRange) {
  const now = new Date();

  // Rango configurable: { from: 8, to: 10 } → entre 8 y 10 horas
  const hoursFrom = customRange?.from ?? 8.5; // valor por defecto
  const hoursTo = customRange?.to ?? 10.5;

  const targetStart = new Date(now.getTime() + hoursFrom * 60 * 60 * 1000);
  const targetEnd = new Date(now.getTime() + hoursTo * 60 * 60 * 1000);

  const q = `
    SELECT c.*, u.nombre AS nombre_usuario, s.nombre AS nombre_staff
    FROM citas c
    JOIN usuarios u ON c.id_usuario = u.id
    LEFT JOIN usuarios s ON c.id_staff = s.id
    WHERE c.estado = 'confirmada' AND c.fecha > $1 AND c.fecha <= $2
  `;

  const result = await pool.query(q, [targetStart, targetEnd]);
  const citas = result.rows;
  const created = [];

  for (const c of citas) {
    const tipo = "recordatorio_" + Math.round(hoursTo) + "h";

    // Evitar duplicados
    const exists = await pool.query(
      "SELECT 1 FROM notificaciones WHERE id_cita = $1 AND tipo = $2 LIMIT 1",
      [c.id, tipo]
    );
    if (exists.rows.length > 0) continue;

    const fechaStr = new Date(c.fecha).toLocaleString();
    const mensaje = `Recordatorio: su cita está programada para ${fechaStr}${
      c.nombre_staff ? " con " + c.nombre_staff : ""
    }.`.trim();

const notif = await Notificacion.crearRecordatorio({
  cita: c,
  tipo,
  mensaje,
  from: "staff", // enviar como si viniera del staff/system para que el cliente lo vea (listarPorUsuario filtra 'from' = 'staff')
});

    await pool.query("UPDATE citas SET recordatorio_enviado = true WHERE id = $1", [c.id]);
    created.push(notif);
  }

  return created;
}


exports.enviarRecordatorios = async (req, res) => {
  try {
    const created = await send24hReminders();
    res.json({
      ok: true,
      enviados: created.length,
      notificaciones: created,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Exportar también la función
exports.send24hReminders = send24hReminders;
