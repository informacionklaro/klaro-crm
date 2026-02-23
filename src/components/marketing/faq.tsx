export default function Faq() {
  const faqs = [
    {
      id: 1,
      question: "¿Puedo ingresar mi propia tasa de cambio?",
      answer:
        "Sí. Aunque recomendamos usar la tasa oficial, el sistema te permite ingresar manualmente la tasa del día al momento de registrar un pago para mantener la flexibilidad de tus negociaciones.",
    },
    {
      id: 2,
      question:
        "¿Qué pasa si un cliente me paga la mitad en Zelle y la mitad en Bs?",
      answer:
        "Esa es la especialidad de Klaro. Puedes registrar múltiples pagos para una misma factura, seleccionando 'Zelle' para el primer monto y 'Pago Móvil' para el segundo, aplicando la tasa correspondiente.",
    },
    {
      id: 3,
      question: "¿Es necesario instalar algún programa?",
      answer:
        "No. Klaro funciona 100% en la nube. Puedes acceder desde tu computadora en la oficina o desde tu celular cuando estés reunido con un cliente.",
    },
    {
      id: 4,
      question: "¿Puedo agregar a mi equipo de ventas?",
      answer:
        "Sí, dependiendo del plan que elijas, puedes invitar a otros vendedores. Ellos podrán gestionar sus propios tratos, pero tú mantendrás el control y la visibilidad de todo el negocio.",
    },
  ];

  return (
    <section id="faq" className="bg-slate-50 py-24 sm:py-32">
      {" "}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Preguntas Frecuentes
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Resolvemos tus dudas sobre cómo Klaro se adapta a tu flujo de caja.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl">
          <dl className="space-y-8">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
              >
                <dt className="text-lg font-semibold leading-7 text-slate-900">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-600">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
