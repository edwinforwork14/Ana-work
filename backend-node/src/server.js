const express = require("express");
const app = express();
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const citaRoutes = require("./routes/citaRoutes");

app.use(express.json());

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