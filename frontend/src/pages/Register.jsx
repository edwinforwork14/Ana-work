// pages/Register.jsx
import { useState } from "react";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">Registro</h2>
      <form className="space-y-4">
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
