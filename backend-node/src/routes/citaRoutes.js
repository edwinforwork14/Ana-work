const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { allowRoles, onlyAdmin, canViewCita, canModifyCita, canCancelCita, canCompleteCita, canMarkPendingCita } = require('../middlewares/permissionMiddleware');

// Proteger todas las rutas con JWT

// Crear cita: solo cliente y staff
router.post('/', authMiddleware, allowRoles(['cliente', 'staff']), citaController.createCita);

// Listar todas las citas: cliente, staff y admin
router.get('/', authMiddleware, allowRoles(['cliente', 'staff', 'admin']), citaController.getAllCitas);

// Obtener cita por ID: cliente, staff y admin
router.get('/:id', authMiddleware, canViewCita, citaController.getCitaById);

// Obtener todas las citas de un usuario específico (solo staff y admin)
router.get('/usuario/:id', authMiddleware, allowRoles(['staff', 'admin']), citaController.getCitasByUsuario);

// Actualizar cita: cliente solo la suya, staff solo la suya, admin cualquiera
router.put('/:id', authMiddleware, canModifyCita, citaController.updateCita);

// Eliminar cita: solo admin
router.delete('/:id', authMiddleware, onlyAdmin, citaController.deleteCita);

// Confirmar cita: solo staff y admin
router.post('/:id/confirmar', authMiddleware, allowRoles(['staff', 'admin']), citaController.confirmarCita);

// Cancelar cita: cliente solo la suya, staff solo la suya, admin cualquiera
router.post('/:id/cancelar', authMiddleware, canCancelCita, citaController.updateCita);

// Completar cita: staff solo la suya, admin cualquiera
router.post('/:id/completar', authMiddleware, canCompleteCita, citaController.updateCita);

// Marcar cita como pendiente: staff solo la suya, admin cualquiera
router.post('/:id/pendiente', authMiddleware, canMarkPendingCita, citaController.updateCita);

module.exports = router;