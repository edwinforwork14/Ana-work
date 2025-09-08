// authMiddleware.js
// Middleware para autenticación
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/auth");

// Requiere token: Authorization: Bearer <token>
const authMiddleware = (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : null;
  if (!token) return res.status(401).json({ error: "Token requerido" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, rol, company: { nombre, rol, industria, tipo } ... }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
};

// Autoriza por rol
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.length) {
      return next();
    }
    if (!req.user?.rol || !roles.includes(req.user.rol)) {
      return res.status(403).json({ error: "No autorizado" });
    }
    return next(); // return para que no siga después de mandar respuesta
  };
};
module.exports = { authMiddleware, authorize };

