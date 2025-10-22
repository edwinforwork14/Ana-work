// pages/Register.jsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
      rol_empresa: rolEmpresa,
    };
    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
    <div className="flex min-h-screen bg-transparent items-center justify-center">
      <div className="relative w-full max-w-md p-6 bg-transparent shadow-none rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-white text-center mb-4">Registro</h2>

        {successMsg && (
          <div className="absolute right-6 bottom-[-2.5rem]">
            <div className="bg-green-600 text-white px-4 py-2 rounded shadow-lg text-sm animate-pulse">
              {successMsg}
            </div>
          </div>
        )}
        {errorMsg && (
          <div className="absolute right-6 bottom-[-2.5rem]">
            <div className="bg-red-600 text-white px-4 py-2 rounded shadow-lg text-sm animate-pulse">
              {errorMsg}
            </div>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="rol" className="text-white px-2 py-1 rounded inline-block">Tipo de cuenta</Label>
            <select
              id="rol"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className=" w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring focus:ring-green-300 text-white"
            >
              <option value="cliente" style={{ backgroundColor: '#000000', color: '#ffffff' }}>Cliente</option>
              <option value="staff" style={{ backgroundColor: '#000000', color: '#ffffff' }}>Staff</option>
              <option value="admin" style={{ backgroundColor: '#000000', color: '#ffffff' }}>Admin</option>
            </select>
          </div>

          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              type="text"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              type="text"
              placeholder="Dirección"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <Label htmlFor="nombreEmpresa">Nombre de la empresa</Label>
            <Input
              id="nombreEmpresa"
              type="text"
              placeholder="Nombre de la empresa"
              value={nombreEmpresa}
              onChange={(e) => setNombreEmpresa(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <Label htmlFor="tipoEmpresa">Tipo de empresa</Label>
            <Input
              id="tipoEmpresa"
              type="text"
              placeholder="Tipo de empresa"
              value={tipoEmpresa}
              onChange={(e) => setTipoEmpresa(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <Label htmlFor="industria">Industria</Label>
            <Input
              id="industria"
              type="text"
              placeholder="Industria"
              value={industria}
              onChange={(e) => setIndustria(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <Label htmlFor="rolEmpresa">Rol en la empresa</Label>
            <Input
              id="rolEmpresa"
              type="text"
              placeholder="Rol en la empresa"
              value={rolEmpresa}
              onChange={(e) => setRolEmpresa(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <Button type="submit" className="w-full bg-green-600 py-3 text-white rounded-md">
            Registrarse
          </Button>
        </form>
      </div>
    </div>
  );
}
