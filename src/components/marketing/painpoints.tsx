import { MessageCircle, FileSpreadsheet, Calculator } from "lucide-react";

export default function PainPoints() {
  return (
    <section id="painpoints" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-blue-600">
            El problema actual
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Llevar un negocio de servicios no debería ser un dolor de cabeza
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Si actualmente inviertes más tiempo cuadrando cuentas y persiguiendo
            pagos que cerrando nuevos clientes, estás perdiendo dinero.
          </p>
        </div>

        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <MessageCircle
                  className="h-6 w-6 text-red-600"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-xl font-semibold leading-7 text-slate-900 mb-2">
                El caos de WhatsApp
              </h3>
              <p className="flex-auto text-base leading-7 text-slate-600">
                Cotizaciones perdidas en el chat, clientes que no responden y
                seguimientos que se olvidan porque el mensaje quedó enterrado.
              </p>
            </div>

            <div className="flex flex-col bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <FileSpreadsheet
                  className="h-6 w-6 text-amber-600"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-xl font-semibold leading-7 text-slate-900 mb-2">
                Excel desactualizado
              </h3>
              <p className="flex-auto text-base leading-7 text-slate-600">
                Celdas rotas y datos manuales que no reflejan la realidad de tus
                finanzas. Nunca sabes exactamente cuánto dinero tienes en la
                calle.
              </p>
            </div>

            <div className="flex flex-col bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                <Calculator
                  className="h-6 w-6 text-orange-600"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-xl font-semibold leading-7 text-slate-900 mb-2">
                Calculadora en mano
              </h3>
              <p className="flex-auto text-base leading-7 text-slate-600">
                Cobrar un servicio en partes, dividiendo el saldo entre Zelle,
                Pago Móvil y aplicando la tasa BCV del día es un proceso manual
                propenso a errores.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
