import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      body: "Antes de Klaro, perdíamos horas cruzando pagos de Zelle y Pago Móvil en Excel. Ahora registro la tasa BCV del día, el cliente recibe su saldo pendiente por WhatsApp y nosotros nos enfocamos en vender.",
      author: {
        name: "Carlos Mendoza",
        handle: "Director General",
        company: "Agencia Creativa",
      },
    },
    {
      body: "El CRM más limpio que he usado. No tiene 500 funciones que nunca uso; tiene exactamente lo que necesito para cotizar rápido, hacer seguimiento y no dejar dinero en la mesa.",
      author: {
        name: "Ana Silva",
        handle: "Consultora Independiente",
        company: "Servicios IT",
      },
    },
  ];

  return (
    <section id="testimonios" className=" bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-lg font-semibold leading-8 tracking-tight text-blue-600">
            Testimonios
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Lo que dicen quienes ya tienen las cuentas claras
          </p>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-2xl lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-50 p-8 text-sm leading-6 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <blockquote className="text-slate-700 text-base">
                  <p>{`"${testimonial.body}"`}</p>
                </blockquote>
                <div className="mt-6 flex items-center gap-x-4">
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                    {testimonial.author.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {testimonial.author.name}
                    </div>
                    <div className="text-slate-600">
                      {testimonial.author.handle} · {testimonial.author.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
