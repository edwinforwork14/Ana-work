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
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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
      if (response.status === 201) {
        setSuccessMsg(data.mensaje || "Registro exitoso");
        setNombre("");
        setEmail("");
        setPassword("");
        setRol("cliente");
        setTelefono("");
        setDireccion("");
        setNombreEmpresa("");
        setTipoEmpresa("");
        setIndustria("");
        setRolEmpresa("");
      } else {
        setErrorMsg(data.error || data.message || "Error en el registro");
      }
    } catch (error) {
      setErrorMsg("Error de red");
    }
  };

  return (
  <div className="max-w-lg mx-auto mt-12 p-8 bg-white shadow-lg rounded-xl relative">
      <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">Registro</h2>
      {successMsg && (
        <div className="absolute" style={{ right: '2rem', bottom: '-2.5rem' }}>
          <div className="bg-green-600 text-white px-4 py-2 rounded shadow-lg text-sm animate-pulse">
            {successMsg}
          </div>
        </div>
      )}
      {errorMsg && (
        <div className="absolute" style={{ right: '2rem', bottom: '-2.5rem' }}>
          <div className="bg-red-600 text-white px-4 py-2 rounded shadow-lg text-sm animate-pulse">
            {errorMsg}
          </div>
        </div>
      )}
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
