const Usuario = require("./src/models/Usuario");

(async () => {
  try {
    const user = await Usuario.create({
      nombre: "Prueba Legal",
      email: "prueba@legal.com",
      password: "123456", // ⚠️ luego encriptar con bcrypt
      rol: "cliente",
      telefono: "3001234567",
      direccion: "Calle Falsa 123",
      nombre_empresa: "Empresa Legal S.A.S",
      tipo_empresa: "SAS",
      industria: "Servicios Jurídicos",
      rol_empresa: "Gerente"
    });
    console.log("Usuario creado:", user);
  } catch (err) {
    console.error(err);
  }
})();

// test.js