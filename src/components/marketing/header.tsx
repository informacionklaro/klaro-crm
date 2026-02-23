"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-x-8">
          <Link
            href="/"
            className="text-2xl font-extrabold text-blue-600 tracking-tight"
          >
            Klaro
          </Link>

          {/* Enlaces de la MISMA página (Usamos <a> para el scroll suave) */}
          <nav className="hidden md:flex gap-x-6">
            <a
              href="#solucion"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Beneficios
            </a>
            <a
              href="#testimonios"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Testimonios
            </a>
            <a
              href="#precios"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Planes
            </a>
            <a
              href="#faq"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              FAQ
            </a>
          </nav>
        </div>

        {/* Botones hacia OTRAS páginas (Usamos <Link> de Next.js) */}
        <div className="flex items-center gap-x-4">
          <Link
            href="/login"
            className="hidden text-sm font-semibold text-slate-900 md:block hover:text-blue-600 transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Prueba gratis
          </Link>
        </div>
      </div>
    </header>
  );
}
