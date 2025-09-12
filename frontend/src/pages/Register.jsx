// pages/Register.jsx
import { useState } from "react";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("cliente");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [tipoEmpresa, setTipoEmpresa] = useState("");
  const [industria, setIndustria] = useState("");
  const [rolEmpresa, setRolEmpresa] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
      nombre,
      email,
      password,
      rol,
      telefono,
      direccion,
      nombre_empresa: nombreEmpresa,
      tipo_empresa: tipoEmpresa,
      industria,
      rol_empresa: rolEmpresa
    };
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (response.ok) {
        // Registro exitoso, puedes mostrar mensaje o redirigir
        console.log('Registro exitoso:', data);
      } else {
        // Error en el registro
        console.error('Error de registro:', data.message || data);
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">Registro</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <select
          value={rol}
          onChange={e => setRol(e.target.value)}
          className="border p-3 w-full rounded-lg focus:ring focus:ring-green-300"
        >
          <option value="cliente">Cliente</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          className="border p-3 w-full rounded-lg focus:ring focus:ring-green-300"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-3 w-full rounded-lg focus:ring focus:ring-green-300"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border p-3 w-full rounded-lg focus:ring focus:ring-green-300"
        />
        <input
          type="text"
          placeholder="Teléfono"
          value={telefono}
          onChange={e => setTelefono(e.target.value)}
          className="border p-3 w-full rounded-lg focus:ring focus:ring-green-300"
        />
        <input
          type="text"
          placeholder="Dirección"
          value={direccion}
          onChange={e => setDireccion(e.target.value)}
          className="border p-3 w-full rounded-lg focus:ring focus:ring-green-300"
        />
        <input
          type="text"
          placeholder="Nombre de la empresa"
          value={nombreEmpresa}
          onChange={e => setNombreEmpresa(e.target.value)}
          className="border p-3 w-full rounded-lg focus:ring focus:ring-green-300"
        />
        <input
          type="text"
          placeholder="Tipo de empresa"
          value={tipoEmpresa}
          onChange={e => setTipoEmpresa(e.target.value)}
          className="border p-3 w-full rounded-lg focus:ring focus:ring-green-300"
        />
        <input
          type="text"
          placeholder="Industria"
          value={industria}
          onChange={e => setIndustria(e.target.value)}
          className="border p-3 w-full rounded-lg focus:ring focus:ring-green-300"
        />
        <input
          type="text"
          placeholder="Rol en la empresa"
          value={rolEmpresa}
          onChange={e => setRolEmpresa(e.target.value)}
          className="border p-3 w-full rounded-lg focus:ring focus:ring-green-300"
        />
        <button
          type="submit"
          className="bg-green-600 text-white w-full py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}
