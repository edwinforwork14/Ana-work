import { useState } from 'react';
import './App.css';

function App() {
  const [contador, setContador] = useState(0);

  return (
    <main className="contenedor-principal">
      <h1>Contador Simple</h1>
      <section className="tarjeta">
        <p>
          Valor actual: <strong>{contador}</strong>
        </p>
        <div className="botones">
          <button onClick={() => setContador(contador + 1)}>
            Incrementar
          </button>
          <button onClick={() => setContador(contador - 1)}>
            Decrementar
          </button>
          <button onClick={() => setContador(0)}>
            Reiniciar
          </button>
        </div>
      </section>
      <footer>
        <p>
          Edita <code>src/App.tsx</code> y guarda para ver los cambios.
        </p>
        <p>
          Usa los botones para modificar el contador.
        </p>
      </footer>
    </main>
  );
}

export default App;