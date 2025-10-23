// ===============================
// 📦 Importaciones de dependencias
// ===============================
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const logger = require("./utils/logger");
const errorHandler = require("./middlewares/errorHandler");
const pool = require("./config/db");

// ===============================
// 🚀 Inicialización de la app
// ===============================
const app = express();

// ===============================
// 🔒 Seguridad y control de tráfico
// ===============================
// Límite de peticiones por IP (previene ataques DoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones por IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ===============================
// 🧾 Logging de peticiones (HTTP)
// ===============================
const logStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });
app.use(morgan("combined", { stream: logStream }));

// ===============================
// ⚙️ Middlewares base
// ===============================
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // frontend permitido
    credentials: true, // permite cookies/sesiones
  })
);

// ===============================
// 🧠 Logging personalizado de cada request
// ===============================
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// ===============================
// 🧩 Rutas principales
// ===============================
const authRoutes = require("./routes/authRoutes");
const citaRoutes = require("./routes/citaRoutes");
const staffRoutes = require("./routes/staffRoutes");
const notificacionRoutes = require("./routes/notificacionRoutes");
const docRoutes = require("./routes/docRoutes");
const adminRoutes = require("./routes/adminroutes");

app.use("/api/auth", authRoutes);
app.use("/api/citas", citaRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/notificaciones", notificacionRoutes);
app.use("/api/documentos", docRoutes);
app.use("/api/admin", adminRoutes);

// ===============================
// 🧪 Rutas de prueba / salud del servidor
// ===============================
app.get("/ping", (_, res) => res.json({ ok: true }));
app.get("/", (_, res) => res.send("API OK"));

// ===============================
// ⏰ Cron de recordatorios automáticos
// ===============================
require("./jobRunner"); // o "./jobRunner" si cambiaste el nombre

// ===============================
// ❌ Middleware 404 - Ruta no encontrada
// ===============================
app.use((req, res, next) => {
  logger.error(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: "Ruta no encontrada" });
});

// ===============================
// ⚠️ Middleware global de manejo de errores
// ===============================
app.use(errorHandler);

// ===============================
// 🚀 Iniciar servidor
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`Servidor ejecutándose en http://localhost:${PORT}`));
