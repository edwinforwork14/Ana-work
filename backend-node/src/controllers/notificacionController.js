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
 * Enviar recordatorios automáticos para citas próximas:
 *  - 24 horas antes
 *  - 8 horas antes
 *  - 2 horas antes
 */
async function sendTimeBasedReminders() {
  const now = new Date();

  console.log(`[${now.toISOString()}] 🔔 Buscando citas próximas para recordatorios...`);

  // Definimos los tipos y sus rangos
  const reminderConfigs = [
    { tipo: "recordatorio_24h", from: 23.5, to: 24.5 },
    { tipo: "recordatorio_8h", from: 7.5, to: 8.5 },
    { tipo: "recordatorio_2h", from: 1.5, to: 2.5 },
  ];

  let totalCreated = [];

  for (const cfg of reminderConfigs) {
    const targetStart = new Date(now.getTime() + cfg.from * 60 * 60 * 1000);
    const targetEnd = new Date(now.getTime() + cfg.to * 60 * 60 * 1000);

    const q = `
      SELECT c.*, u.nombre AS nombre_usuario, s.nombre AS nombre_staff
      FROM citas c
      JOIN usuarios u ON c.id_usuario = u.id
      LEFT JOIN usuarios s ON c.id_staff = s.id
      WHERE c.estado = 'confirmada'
        AND c.fecha > $1
        AND c.fecha <= $2
    `;

    const result = await pool.query(q, [targetStart, targetEnd]);
    const citas = result.rows;

    for (const c of citas) {
      // Evitar enviar el mismo tipo dos veces
      const exists = await pool.query(
        "SELECT 1 FROM notificaciones WHERE id_cita = $1 AND tipo = $2 LIMIT 1",
        [c.id, cfg.tipo]
      );
      if (exists.rows.length > 0) continue;

      const fechaStr = new Date(c.fecha).toLocaleString();
      const mensaje = `📅 Recordatorio: su cita está programada para ${fechaStr}${
        c.nombre_staff ? " con " + c.nombre_staff : ""
      }.`.trim();

      const notif = await Notificacion.crearRecordatorio({
        cita: c,
        tipo: cfg.tipo,
        mensaje,
        from: "staff", // se muestra al cliente como si viniera del staff/sistema
      });

      await pool.query("UPDATE citas SET recordatorio_enviado = true WHERE id = $1", [c.id]);

      totalCreated.push(notif);
    }
  }

  console.log(`✅ Recordatorios creados: ${totalCreated.length}`);
  return totalCreated;
}

/**
 * Ruta manual (para probar desde Postman o navegador)
 */
exports.enviarRecordatorios = async (req, res) => {
  try {
    const created = await sendTimeBasedReminders();
    res.json({
      ok: true,
      enviados: created.length,
      notificaciones: created,
    });
  } catch (e) {
    console.error("❌ Error enviando recordatorios:", e);
    res.status(500).json({ error: e.message });
  }
};

// Exportar la función para el jobRunner
exports.sendTimeBasedReminders = sendTimeBasedReminders;
