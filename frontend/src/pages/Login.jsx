import { useState } from 'react';

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();
		// Aquí puedes agregar la lógica de autenticación
		console.log('Email:', email, 'Password:', password);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
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
