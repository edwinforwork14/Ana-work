import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export default function Login({ onLoginSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(""); // Cambiado de username a email
  const [password, setPassword] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem("token", data.token);
          setLoginSuccess(true);
          setErrorMsg("");

          if (onLoginSuccess) onLoginSuccess();

          setTimeout(() => {
            setLoginSuccess(false);
            navigate("/");
          }, 2000);
        }
      } else {
        setErrorMsg(data.error || data.message || "Error de autenticación");
      }
    } catch (error) {
      setErrorMsg("Error de conexión con el servidor");
    }
  };

  return (
    <div className="flex min-h-screen bg-transparent items-center justify-center">
      <div className="relative w-full max-w-md p-6 bg-transparent shadow-none rounded-lg">
        <h1 className="text-2xl font-semibold text-gray-700 dark:text-white text-center mb-4">
          Iniciar sesión
        </h1>

        {loginSuccess && (
          <div className="absolute right-6 bottom-[-2.5rem]">
            <div className="bg-green-600 text-white px-4 py-2 rounded shadow-lg text-sm animate-pulse">
              ¡Inicio de sesión exitoso!
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="email"
            id="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border-gray-300 shadow-sm focus:ring focus:ring-green-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />

          <div className="flex items-center">
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:ring focus:ring-green-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="button"
              className="ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full rounded-md bg-green-600 py-2 px-4 text-white hover:bg-green-700 dark:hover:bg-green-800"
          >
            Iniciar sesión
          </Button>

          <Button
            type="button"
            onClick={() => navigate("/register")}
            className="w-full rounded-md bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 dark:hover:bg-blue-800"
          >
            Crear cuenta
          </Button>
        </form>

        <div className="mt-4">
          <Alert>
            <AlertTitle>¿Necesitas ayuda?</AlertTitle>
            <AlertDescription>
              Contacta al soporte para asistencia.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}


