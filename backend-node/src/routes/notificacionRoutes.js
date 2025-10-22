const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const notificacionController = require("../controllers/notificacionController");


const router = express.Router();

router.get("/", authMiddleware, notificacionController.listar);
router.post("/:id/leida", authMiddleware, notificacionController.marcarLeida);

router.post("/recordatorios-24h", notificacionController.send24hReminders);


module.exports = router;
