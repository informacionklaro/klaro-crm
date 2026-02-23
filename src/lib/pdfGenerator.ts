import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generarReciboPDF = (pago: any) => {
  const doc = new jsPDF();
  const date = new Date(pago.created_at).toLocaleDateString("es-VE");
  const receiptNumber = pago.id.split("-")[0].toUpperCase();

  // --- CABECERA ---
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);
  doc.text("RECIBO DE PAGO", 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`N° Control: #${receiptNumber}`, 14, 30);
  doc.text(`Fecha: ${date}`, 14, 35);

  // --- DATOS DEL CLIENTE ---
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text("CLIENTE:", 14, 50);
  doc.setFont("helvetica", "bold");
  doc.text(pago.deals?.clients?.name || "Cliente General", 14, 56);
  doc.setFont("helvetica", "normal");

  // --- TABLA DE DETALLE ---
  // Usamos la función importada directamente en lugar de doc.autoTable
  autoTable(doc, {
    startY: 65,
    head: [["Descripción del Proyecto", "Método", "Monto USD"]],
    body: [
      [
        pago.deals?.title || "Abono a proyecto",
        pago.method.replace("_", " ").toUpperCase(),
        `$${Number(pago.amount_paid_usd).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      ],
    ],
    headStyles: { fillColor: [30, 41, 59] },
    theme: "grid",
  });

  // --- INFORMACIÓN FINANCIERA ---
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setTextColor(100);

  if (pago.method.includes("ves") || pago.method === "pago_movil") {
    doc.text(
      `Tasa BCV aplicada: Bs. ${Number(pago.bcv_rate).toLocaleString("es-VE", { minimumFractionDigits: 4 })}`,
      14,
      finalY,
    );
    doc.setFont("helvetica", "bold");
    doc.text(
      `Total Recibido: Bs. ${Number(pago.total_received_currency).toLocaleString("es-VE", { minimumFractionDigits: 2 })}`,
      14,
      finalY + 7,
    );
  } else {
    if (pago.apply_igtf) {
      doc.text("Incluye 3% IGTF por pago en divisas", 14, finalY);
    }
    doc.setFont("helvetica", "bold");
    doc.text(
      `Total Recibido: $${Number(pago.total_received_currency).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      14,
      finalY + 7,
    );
  }

  // --- NOTA AL PIE ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(
    "Este documento es un comprobante de pago digital generado por Klaro CRM.",
    105,
    280,
    { align: "center" },
  );

  doc.save(`Recibo_${receiptNumber}.pdf`);
};
