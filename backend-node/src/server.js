// server.js
// Archivo principal para iniciar el servidor Express
const express = require('express');
const app = express();

app.use(express.json());

// Aquí se agregarán los middlewares y rutas

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});
