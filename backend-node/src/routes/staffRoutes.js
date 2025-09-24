
const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const staffController = require('../controllers/staffController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/permissionMiddleware');


// ====== CONSULTAS ======

//Filtrar citas por id y estado
///api/staff/citas?id_staff=ID&estado=ESTADO

// Listar todos los staff (accesible para cliente, staff y admin)
router.get('/', authMiddleware, allowRoles(['cliente', 'staff', 'admin']), staffController.getAllStaff);

// Ver todas las citas pendientes asignadas al staff autenticado
router.get('/alertas', authMiddleware, allowRoles(['staff']), staffController.getAlertasPendientesStaff);

// Obtener citas del staff autenticado o de cualquier staff (admin) por estado
router.get('/citas', authMiddleware, allowRoles(['staff', 'admin']), staffController.getCitasByStaffAndEstado);


// Disponibilidad de staff (clientes, staff y admin)
router.get('/disponibilidad', authMiddleware, allowRoles(['cliente', 'staff', 'admin']), staffController.getDisponibilidadStaff);



module.exports = router;