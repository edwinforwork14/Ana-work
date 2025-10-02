const pool = require("../config/db");

const Usuario = {
  create: async ({
    nombre, email, password, rol = "cliente",
    telefono, direccion, nombre_empresa, tipo_empresa, industria, rol_empresa
  }) => {
    const q = `
      INSERT INTO usuarios
      (nombre, email, password, rol, telefono, direccion, nombre_empresa, tipo_empresa, industria, rol_empresa)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id, nombre, email, rol, telefono, direccion, nombre_empresa, tipo_empresa, industria, rol_empresa, creado_en
    `;
    const params = [nombre, email, password, rol, telefono, direccion, nombre_empresa, tipo_empresa, industria, rol_empresa];
    const result = await pool.query(q, params);
    return result.rows[0];
  },

  findByEmail: async (email) => {
    const q = `SELECT * FROM usuarios WHERE email = $1`;
    const result = await pool.query(q, [email]);
    return result.rows[0]; // incluye password hash
  },

  findPublicById: async (id) => {
    const q = `
      SELECT id, nombre, email, rol, telefono, direccion, nombre_empresa, tipo_empresa, industria, rol_empresa, creado_en
      FROM usuarios WHERE id = $1
    `;
    const r = await pool.query(q, [id]);
    return r.rows[0];
  },
  // Obtener todos los usuarios con rol staff
  getStaffs: async () => {
    const q = `SELECT id, nombre, email, rol, telefono FROM usuarios WHERE rol = 'staff' ORDER BY nombre`;
    const result = await pool.query(q);
    return result.rows;
  }
    ,
    // Buscar usuario por id (incluye password)
    findById: async (id) => {
      const q = `SELECT * FROM usuarios WHERE id = $1`;
      const result = await pool.query(q, [id]);
      return result.rows[0];
    },
    // Actualizar contraseña
    updatePassword: async (id, hashedPassword) => {
      const q = `UPDATE usuarios SET password = $1 WHERE id = $2`;
      await pool.query(q, [hashedPassword, id]);
      return true;
    }
};

module.exports = Usuario;
