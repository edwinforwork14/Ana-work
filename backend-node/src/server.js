const express = require("express");
const cors = require("cors");
const app = express();
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const citaRoutes = require("./routes/citaRoutes");
const staffRoutes = require('./routes/staffRoutes');
const notificacionRoutes = require("./routes/notificacionRoutes");

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones por IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

app.use(morgan('combined', { stream: logStream }));
app.use(express.json());
app.use("/api/notificaciones", notificacionRoutes);

// Configura CORS para permitir solicitudes desde el frontend
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));



//verificar si el servidor está corriendo
app.get("/ping", (req, res) => {
  res.json({ ok: true });
});

// Logging de cada petición
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// rutas
app.use("/api/auth", authRoutes);
app.use("/api/citas", citaRoutes);
app.use('/api/staff', staffRoutes);

// ping
app.get("/", (_, res) => res.send("API OK"));

// Middleware para rutas no encontradas (404)
app.use((req, res, next) => {
  console.error(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Middleware para errores generales
app.use((err, req, res, next) => {
  console.error("Error general:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));