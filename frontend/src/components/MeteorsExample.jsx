import { Meteors } from '@/components/ui/shadcn-io/meteors';

const MeteorsExample = () => {
  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Fondo negro y meteoros morados */}
      <Meteors number={36} color="#8b5cf6" />

      <div className="relative z-10 p-6">
        <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
          Meteors
        </span>
        <main className="mt-12 text-center">
          <h1 className="text-4xl font-bold">Fondo de Meteoros</h1>
          <p className="mt-4 max-w-xl mx-auto opacity-90">
            Ejemplo: el fondo está fijo detrás del contenido. Si no lo ves, aumenta el número y/o cambia el color.
          </p>
        </main>
      </div>
    </div>
  );
};

export default MeteorsExample;
