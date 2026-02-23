import { RefreshCw, Receipt, CheckCircle } from "lucide-react";

export default function Solution() {
  return (
    <section
      id="solucion"
      className="overflow-hidden bg-slate-900 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-blue-400">
                Control Multimoneda
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Cobra exactamente lo que es, en la moneda que sea
              </p>
              <p className="mt-6 text-lg leading-8 text-slate-300">
                Klaro fue construido entendiendo que un pago rara vez ocurre en
                una sola vía. Registra pagos parciales y combinados con
                precisión contable.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-slate-300 lg:max-w-none">
                <div className="relative pl-9">
                  <dt className="inline font-semibold text-white">
                    <RefreshCw
                      className="absolute left-1 top-1 h-5 w-5 text-blue-400"
                      aria-hidden="true"
                    />
                    Tasa BCV integrada.
                  </dt>{" "}
                  <dd className="inline">
                    Registra el abono en bolívares indicando la tasa del día. El
                    sistema calcula automáticamente el equivalente exacto a
                    descontar de la deuda en dólares.
                  </dd>
                </div>

                <div className="relative pl-9">
                  <dt className="inline font-semibold text-white">
                    <Receipt
                      className="absolute left-1 top-1 h-5 w-5 text-blue-400"
                      aria-hidden="true"
                    />
                    Cálculo de IGTF automático.
                  </dt>{" "}
                  <dd className="inline">
                    Si tu cliente decide pagar una parte en divisas en efectivo,
                    el sistema puede sumar automáticamente el 3% correspondiente
                    a esa fracción.
                  </dd>
                </div>

                <div className="relative pl-9">
                  <dt className="inline font-semibold text-white">
                    <CheckCircle
                      className="absolute left-1 top-1 h-5 w-5 text-blue-400"
                      aria-hidden="true"
                    />
                    Saldos claros por WhatsApp.
                  </dt>{" "}
                  <dd className="inline">
                    Genera un estado de cuenta en un clic y envíaselo a tu
                    cliente con el saldo exacto pendiente para liquidar la
                    cotización.
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Placeholder para la imagen de la interfaz de cobranza */}
          <div className="relative">
            <div className="w-[48rem] max-w-none rounded-xl bg-slate-800 shadow-2xl ring-1 ring-white/10 sm:w-[57rem] h-[400px] flex items-center justify-center border border-slate-700">
              <p className="text-slate-400">
                [Captura del modal Registrar Pago con campos de Tasa BCV y Pago
                Parcial]
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
