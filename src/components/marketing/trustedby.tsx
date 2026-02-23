export default function TrustedBy() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-sm font-semibold text-slate-500 mb-8 uppercase tracking-wide">
          Respaldado por líderes de proyectos y agencias en crecimiento
        </p>
        <div className="flex justify-center items-center gap-8 md:gap-16 flex-wrap opacity-60 grayscale">
          {/* Aquí reemplazarás estos bloques con los logos reales (.svg o .png) de tus clientes */}
          <div className="h-8 w-32 bg-slate-300 rounded animate-pulse"></div>
          <div className="h-8 w-32 bg-slate-300 rounded animate-pulse"></div>
          <div className="h-8 w-32 bg-slate-300 rounded animate-pulse"></div>
          <div className="h-8 w-32 bg-slate-300 rounded animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
