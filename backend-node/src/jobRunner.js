// 🟢 Cargar variables de entorno ANTES de cualquier otra importación
require("dotenv").config();

const cron = require("node-cron");
const { send24hReminders } = require("./controllers/notificacionController");

console.log("🕐 Iniciando tareas automáticas de recordatorios...");

// Función que ejecuta los recordatorios
async function ejecutarRecordatorios() {
  console.log(`[${new Date().toISOString()}] 🔔 Ejecutando recordatorios automáticos...`);

  try {
    // Recordatorios 24h
    const r24 = await send24hReminders({ from: 23.5, to: 24.5 });
    console.log(`📅 Recordatorios 24h enviados: ${r24.length}`);

    // Recordatorios 8h
    const r8 = await send24hReminders({ from: 8, to: 10 });
    console.log(`⏰ Recordatorios 8h enviados: ${r8.length}`);

    // Recordatorios 4h
    const r4 = await send24hReminders({ from: 4, to: 6 });
    console.log(`⚡ Recordatorios 4h enviados: ${r4.length}`);

    console.log(`[${new Date().toISOString()}] ✅ Recordatorios enviados correctamente.`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌ Error en cron de recordatorios:`, err.message);
  }
}

// 🕐 Programar ejecución cada hora
cron.schedule("0 * * * *", ejecutarRecordatorios);

// 🚀 Ejecutar también una vez al iniciar (opcional, para pruebas)
ejecutarRecordatorios();