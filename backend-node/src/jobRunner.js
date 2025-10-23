// 🟢 Cargar variables de entorno ANTES de cualquier otra importación
require("dotenv").config();

const cron = require("node-cron");
const { sendTimeBasedReminders } = require("./controllers/notificacionController");
const pool = require("./config/db");

console.log("🕐 Iniciando tareas automáticas de recordatorios múltiples...");

async function ejecutarRecordatorios() {
  console.log(`[${new Date().toISOString()}] 🔔 Buscando citas próximas...`);

  try {
    const creados = await sendTimeBasedReminders();
    console.log(`✅ Recordatorios creados: ${creados.length}`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌ Error en cron de recordatorios:`, err.message);
  }
}

// 🕐 Ejecutar cada 5 horas
cron.schedule("0 */5 * * *", ejecutarRecordatorios);

// 🚀 Ejecutar una vez al iniciar (opcional para pruebas)
ejecutarRecordatorios();
