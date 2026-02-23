import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Pricing() {
  return (
    <section id="precios" className="bg-slate-900 py-24 sm:py-32">
      {" "}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-2xl mb-16">
          <h2 className="text-base font-semibold leading-7 text-blue-400">
            Planes y Precios
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Una inversión que recuperas con tu próximo cierre
          </p>
        </div>

        <div className="mx-auto max-w-md rounded-3xl ring-1 ring-white/10 bg-white/5 p-8 xl:p-10 text-left shadow-2xl">
          <div className="flex items-baseline justify-between gap-x-4 mb-6">
            <h3 className="text-2xl font-semibold text-white">Plan Agencia</h3>
            <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold leading-5 text-blue-400">
              Más popular
            </span>
          </div>
          <p className="flex items-baseline gap-x-1 mb-8">
            <span className="text-5xl font-bold tracking-tight text-white">
              $15
            </span>
            <span className="text-sm font-semibold leading-6 text-slate-400">
              /mes
            </span>
          </p>
          <Link
            href="/register"
            className="mb-8 block rounded-lg bg-blue-600 px-3 py-3 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
          >
            Comenzar prueba gratis de 14 días
          </Link>
          <ul className="space-y-4 text-sm leading-6 text-slate-300">
            <li className="flex gap-x-3">
              <CheckCircle2 className="h-6 w-5 flex-none text-blue-400" /> Hasta
              3 usuarios en el mismo equipo
            </li>
            <li className="flex gap-x-3">
              <CheckCircle2 className="h-6 w-5 flex-none text-blue-400" />{" "}
              Pipeline y clientes ilimitados
            </li>
            <li className="flex gap-x-3">
              <CheckCircle2 className="h-6 w-5 flex-none text-blue-400" />{" "}
              Cobros multimoneda y Tasa BCV
            </li>
            <li className="flex gap-x-3">
              <CheckCircle2 className="h-6 w-5 flex-none text-blue-400" />{" "}
              Generador de cotizaciones en PDF
            </li>
            <li className="flex gap-x-3">
              <CheckCircle2 className="h-6 w-5 flex-none text-blue-400" />{" "}
              Enlaces de cobro rápido por WhatsApp
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
