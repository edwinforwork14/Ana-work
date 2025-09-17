const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/permissionMiddleware');

router.get('/disponibilidad', authMiddleware, allowRoles(['cliente', 'staff', 'admin']), staffController.getDisponibilidadStaff);

module.exports = router;