const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/permissionMiddleware');

// Proteger todas las rutas con JWT

// Crear cita: solo cliente y staff
router.post('/', authMiddleware, allowRoles(['cliente', 'staff']), citaController.createCita);

// Listar todas las citas: cliente, staff y admin
router.get('/', authMiddleware, allowRoles(['cliente', 'staff', 'admin']), citaController.getAllCitas);

// Obtener cita por ID: cliente, staff y admin
router.get('/:id', authMiddleware, allowRoles(['cliente', 'staff', 'admin']), citaController.getCitaById);

// Obtener todas las citas de un usuario específico (solo staff y admin)
router.get('/usuario/:id', authMiddleware, allowRoles(['staff', 'admin']), citaController.getCitasByUsuario);

// Actualizar cita: solo staff y admin
router.put('/:id', authMiddleware, allowRoles(['cliente', 'staff', 'admin']), citaController.updateCita);

// Eliminar cita: solo admin
router.delete('/:id', authMiddleware, allowRoles(['admin']), citaController.deleteCita);

module.exports = router;