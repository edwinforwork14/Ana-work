const express = require('express');
const router = express.Router();
const documentoController = require('../controllers/documentoController');

// Ruta para subir documento (requiere id_cita en body y archivo en 'archivo')
router.post('/upload', documentoController.upload.single('archivo'), documentoController.subirDocumento);

module.exports = router;
// docRoutes.js
// Rutas de documentos
