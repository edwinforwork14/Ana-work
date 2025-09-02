// server.js
// Archivo principal para iniciar el servidor Express
const express = require("express");
const app = express();
const pool = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");

const citaRoutes = require("./src/routes/citaRoutes");

app.use(express.json());

// rutas
app.use("/api/auth", authRoutes);

app.use("/api/citas", citaRoutes);

// ping
app.get("/", (_, res) => res.send("API OK"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));