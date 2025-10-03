import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLoginSuccess }) {
		const [email, setEmail] = useState('');
		const [password, setPassword] = useState('');
		const [loginSuccess, setLoginSuccess] = useState(false);
		const [errorMsg, setErrorMsg] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
			try {
				const response = await fetch('http://localhost:3000/api/auth/login', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ email, password }),
				});
				const data = await response.json();
				if (response.ok) {
					// Autenticación exitosa, guarda el token JWT
					if (data.token) {
						localStorage.setItem('token', data.token);
						setLoginSuccess(true);
						setErrorMsg("");
						if (onLoginSuccess) onLoginSuccess();
						setTimeout(() => {
							setLoginSuccess(false);
							navigate('/');
						}, 2000); // Oculta el mensaje y redirige después de 2 segundos
					}
				} else {
					// Error de autenticación
					setErrorMsg(data.error || data.message || "Error de login");
				}
			} catch (error) {
				setErrorMsg("Error de red");
			}
	};

	return (
			<div className="min-h-screen flex items-center justify-center bg-gray-100">
				<div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg relative">
					{loginSuccess && (
						<div className="absolute" style={{ right: '2rem', bottom: '-2.5rem' }}>
							<div className="bg-green-600 text-white px-4 py-2 rounded shadow-lg text-sm animate-pulse">
								¡Inicio de sesión exitoso!
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
					<h2 className="text-2xl font-bold text-green-600 mb-6 text-center">Iniciar sesión</h2>
					<form className="space-y-6" onSubmit={handleSubmit}>
						<input
							type="email"
							placeholder="Email"
							value={email}
							onChange={e => setEmail(e.target.value)}
							className="border p-3 w-full rounded-lg focus:ring focus:ring-green-300"
							required
						/>
						<input
							type="password"
							placeholder="Contraseña"
							value={password}
							onChange={e => setPassword(e.target.value)}
							className="border p-3 w-full rounded-lg focus:ring focus:ring-green-300"
							required
						/>
						<button
							type="submit"
							className="bg-green-600 text-white w-full py-3 rounded-lg font-semibold hover:bg-green-700 transition"
						>
							Iniciar sesión
						</button>
					</form>
				</div>
			</div>
	);
}

export default Login;
