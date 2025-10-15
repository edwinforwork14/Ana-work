const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const documentoController = require('../controllers/documentoController');
const { allowRoles, canViewDocumento, canDeleteDocumento } = require('../middlewares/permissionMiddleware');

// Listar archivos de una cita para el usuario autenticado
router.get('/cita/:id_cita', authMiddleware, allowRoles(['cliente', 'staff', 'admin']), documentoController.listarArchivosPorCita);
// Obtener todos los documentos subidos por el usuario autenticado, con filtros opcionales
router.get('/mis-documentos', authMiddleware, allowRoles(['cliente', 'staff', 'admin']), documentoController.obtenerDocumentos);

// Ruta para ver/descargar un documento por su ID
router.get('/ver/:id_documento', authMiddleware, canViewDocumento, documentoController.verDocumento);
// Ruta para forzar descarga (útil para Postman "Send and Download")
router.get('/download/:id_documento', authMiddleware, canViewDocumento, documentoController.downloadDocumento);

// Ruta de depuración: devuelve metadata (no devuelve binario)
// debug endpoint removed

// Ruta para subir documento (requiere id_cita en body y archivo en 'archivo')
router.post('/upload', authMiddleware, allowRoles(['cliente', 'staff']), documentoController.upload.single('archivo'), documentoController.subirDocumento);

// Ruta para eliminar documento (requiere id_documento y id_cita en body)
router.delete('/eliminar', authMiddleware, allowRoles(['cliente', 'staff', 'admin']), canDeleteDocumento, documentoController.eliminarDocumento);

module.exports = router;
