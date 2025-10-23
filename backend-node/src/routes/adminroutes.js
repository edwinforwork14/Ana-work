const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/permissionMiddleware');
const adminController = require('../controllers/adminController');

// Todas las rutas bajo /api/admin requieren autenticación y rol admin
router.use(authMiddleware, allowRoles(['admin']));

// === Citas ===
router.get('/citas', adminController.listAllCitas);
router.get('/citas/con-documentos', adminController.listCitasWithDocumentos);
router.get('/citas/:id/historial', adminController.getClienteHistorial); // puedes cambiar a getCitaHistorial si deseas separar

// === Clientes / Usuarios ===
router.get('/clientes/:id/historial', adminController.getClienteHistorial);
router.get('/usuarios', adminController.listUsuarios);
router.get('/usuarios/:id/historial', adminController.getUsuarioHistorial);
router.delete('/usuarios/:id', adminController.deleteUsuario);

// === Panel de control ===
router.get('/panel', adminController.getAdminPanelMetrics);

module.exports = router;
