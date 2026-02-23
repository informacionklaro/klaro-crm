import { Mail, MessageSquare } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            ¿Tienes alguna duda específica?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Estamos aquí para ayudarte a configurar el flujo de ventas de tu
            negocio.
          </p>
        </div>

        <div className="mx-auto max-w-2xl grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="flex flex-col items-center p-8 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <MessageSquare className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">WhatsApp</h3>
            <p className="mt-2 text-slate-600 text-sm mb-4">
              Escríbenos directamente para una respuesta rápida.
            </p>
            <a
              href="#"
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              Chatear con soporte &rarr;
            </a>
          </div>

          <div className="flex flex-col items-center p-8 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <Mail className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">
              Correo Electrónico
            </h3>
            <p className="mt-2 text-slate-600 text-sm mb-4">
              Para consultas técnicas o planes empresariales.
            </p>
            <a
              href="mailto:informacionklaro@gmail.com"
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              informacionklaro@gmail.com &rarr;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
