import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-klaro-light pt-24 pb-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        {/* Etiqueta de novedad para generar curiosidad */}
        <div className="mb-8 flex justify-center">
          <span className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-klaro-primary border border-blue-200">
            Diseñado exclusivamente para negocios de servicios
          </span>
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight text-klaro-dark sm:text-6xl mb-6 leading-tight">
          Vende más. Cobra exacto. <br className="hidden md:block" />
          <span className="text-klaro-primary">
            Dile adiós al caos de Excel.
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-600 mb-10">
          Klaro es el CRM que organiza tu embudo de ventas y automatiza el
          registro de cobros parciales. Maneja Zelle, Pago Móvil, Efectivo y
          cálculos del BCV sin que se te escape un solo dólar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-klaro-primary px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-klaro-hover transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            Comenzar prueba gratis de 14 días <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-slate-500 sm:ml-4 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sin tarjeta de
            crédito
          </p>
        </div>

        {/* Mockup del producto para generar Engage visual */}
        <div className="mt-16 sm:mt-24 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Un brillo de fondo para resaltar la imagen */}
            <div className="h-[400px] w-[600px] bg-blue-400/20 blur-[100px] rounded-full"></div>
          </div>
          <div className="relative mx-auto max-w-5xl rounded-2xl border border-slate-200/50 bg-white/40 p-2 backdrop-blur-sm shadow-2xl">
            <div className="aspect-[16/9] w-full rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
              <p className="text-slate-400 font-medium">
                [Captura real del Dashboard con gráficas y el Pipeline Kanban]
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
