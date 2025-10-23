const pool = require('../config/db');
const { format } = require('date-fns');
const { es } = require('date-fns/locale');

async function run() {
  console.log('Buscando notificaciones de tipo cita_confirmada_cliente...');
  try {
  const res = await pool.query("SELECT n.id AS notif_id, n.id_cita, n.id_staff, c.fecha, c.end_time FROM notificaciones n JOIN citas c ON n.id_cita = c.id WHERE n.tipo = 'cita_confirmada_cliente'");
    console.log(`Encontradas ${res.rows.length} notificaciones`);
    for (const row of res.rows) {
      const d = new Date(row.fecha);
      let fechaStr;
      try {
        fechaStr = format(d, "EEEE d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
        fechaStr = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1);
      } catch (e) {
        fechaStr = row.fecha;
      }
      const staffNameRes = row.id_staff ? await pool.query('SELECT nombre FROM usuarios WHERE id = $1', [row.id_staff]) : null;
      const staffName = staffNameRes && staffNameRes.rows[0] ? staffNameRes.rows[0].nombre : 'Staff';
      let dur = 60;
      if (row.end_time && row.fecha) {
        try {
          const start = new Date(row.fecha);
          const end = new Date(row.end_time);
          const mins = Math.round((end - start) / 60000);
          if (!isNaN(mins) && mins > 0) dur = mins;
        } catch (e) {
          // keep default
        }
      }
      const newMsg = `Tu cita para el ${fechaStr} ha sido confirmada por el staff ${staffName}. Duración: ${dur} minutos.`;
      await pool.query('UPDATE notificaciones SET mensaje = $1 WHERE id = $2', [newMsg, row.notif_id]);
      console.log(`Actualizada notificación id=${row.notif_id}`);
    }
    console.log('Proceso finalizado.');
    process.exit(0);
  } catch (err) {
    console.error('Error actualizando notificaciones:', err);
    process.exit(1);
  }
}

run();
