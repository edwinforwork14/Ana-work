const Cita = require("./models/Cita");

async function test() {
  // Crear una cita
  const cita = await Cita.create({
    cliente_id: 1,
    fecha: "2025-09-10",
    motivo: "Prueba directa",
    persona_asignada_id: 2
  });
  console.log("Cita creada:", cita);

  // Buscar por ID
  const encontrada = await Cita.findById(cita.id);
  console.log("Cita encontrada:", encontrada);

  // Listar todas las citas de un cliente
  const todas = await Cita.findAllByCliente(1);
  console.log("Citas del cliente:", todas);
}

test();