"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Receipt,
  DollarSign,
  Wallet,
  X,
  ArrowRight,
  Download,
  FileText,
} from "lucide-react";
import { exportToExcel } from "@/lib/export";
import { generarReciboPDF } from "@/lib/pdfGenerator";
import { logActivity } from "@/lib/activity";

export default function CobranzaPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados del Modal de Pagos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estados del Formulario Reactivo
  const [amountUsd, setAmountUsd] = useState("");
  const [bcvRate, setBcvRate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pago_movil");
  const [applyIgtf, setApplyIgtf] = useState(false);

  // 1. Carga inicial al entrar a la página
  useEffect(() => {
    loadData();
  }, []);

  // 2. Función maestra de consulta (Sin estados síncronos al inicio)
  const loadData = async () => {
    // A. Traemos los tratos ganados/en negociación
    const { data: dealsData } = await supabase
      .from("deals")
      .select("id, title, amount_usd, stage, clients(name)")
      .in("stage", ["ganado", "negociacion"])
      .order("created_at", { ascending: false });

    // B. Traemos todo el historial de pagos
    const { data: paymentsData } = await supabase
      .from("payments")
      .select("*, deals(title, clients(name))")
      .order("created_at", { ascending: false });

    if (dealsData) setDeals(dealsData);
    if (paymentsData) setPayments(paymentsData);

    // Solo apagamos la carga al final (Esto sí lo permite React porque viene después del await)
    setLoading(false);
  };

  // Cálculo de Cuentas por Cobrar
  const pendingDeals = deals
    .map((deal) => {
      const totalPaid = payments
        .filter((p) => p.deal_id === deal.id)
        .reduce((acc, curr) => acc + Number(curr.amount_paid_usd), 0);

      return {
        ...deal,
        totalPaid,
        balance: deal.amount_usd - totalPaid,
        progress: Math.min((totalPaid / deal.amount_usd) * 100, 100),
      };
    })
    .filter((deal) => deal.balance > 0); // Solo mostramos los que deben dinero

  // --- LÓGICA DEL MODAL REACTIVO ---
  const openPaymentModal = (deal: any) => {
    setSelectedDeal(deal);
    setAmountUsd(deal.balance.toString()); // Sugerimos pagar el saldo completo
    setBcvRate("");
    setPaymentMethod("pago_movil");
    setApplyIgtf(false);
    setIsModalOpen(true);
  };

  // Cálculo en vivo de la conversión
  const calculateTotalReceived = () => {
    const usd = Number(amountUsd) || 0;
    const rate = Number(bcvRate) || 1;
    let total = 0;

    if (paymentMethod === "cash_usd" || paymentMethod === "zelle") {
      total = usd; // Recibes dólares exactos
      if (applyIgtf && paymentMethod === "cash_usd") total = usd * 1.03; // +3% IGTF
    } else {
      total = usd * rate; // Recibes Bolívares
    }
    return total;
  };

  const handleSavePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const newPayment = {
      deal_id: selectedDeal.id,
      bcv_rate: Number(bcvRate) || 1, // Si paga en USD exactos y deja vacío, ponemos 1
      method: paymentMethod,
      amount_paid_usd: Number(amountUsd),
      total_received_currency: calculateTotalReceived(),
      apply_igtf: applyIgtf,
    };
    // Busca el handleSavePayment y agrégalo así después del insert del pago:
    const { error } = await supabase.from("payments").insert([newPayment]);

    if (!error) {
      // OBTENER NOMBRE DEL CLIENTE PARA EL LOG (porque selectedDeal lo tiene)
      const clienteLog = selectedDeal?.clients?.name || "un cliente";

      await supabase.from("activity_logs").insert([
        {
          tenant_id: (await supabase.auth.getSession()).data.session?.user.id, // Supabase RLS lo arreglará
          user_name: (
            await supabase
              .from("users")
              .select("name")
              .eq(
                "id",
                (await supabase.auth.getSession()).data.session?.user.id,
              )
              .single()
          ).data?.name,
          action: "registró un pago de",
          entity_name: `${clienteLog} ($${Number(amountUsd).toLocaleString()})`,
        },
      ]);

      await loadData();
      setIsModalOpen(false);
    }

    if (error) {
      alert("Error registrando el pago.");
      console.error(error);
    } else {
      await loadData(); // Recargamos todo para actualizar balances
      setIsModalOpen(false);
    }
    setIsSaving(false);
  };

  if (loading)
    return (
      <div className="p-8 text-slate-500 font-medium">
        Cargando libro mayor...
      </div>
    );

  const handleExportPayments = () => {
    const dataToExport = payments.map((p) => ({
      Fecha: new Date(p.created_at).toLocaleDateString("es-VE"),
      Cliente: p.deals?.clients?.name,
      Proyecto: p.deals?.title,
      "Método de Pago": p.method,
      "Monto Descontado (USD)": p.amount_paid_usd,
      "Monto Físico Recibido": p.total_received_currency,
      "Tasa BCV Aplicada": p.bcv_rate,
      "Incluye IGTF": p.apply_igtf ? "Sí" : "No",
    }));
    exportToExcel(dataToExport, "Reporte_Cobranzas");
  };

  return (
    <div className="flex flex-col h-full relative space-y-8">
      {/* Cabecera */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Control de Cobranzas
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Registra pagos parciales, aplica tasas del BCV y controla el IGTF.
        </p>
      </div>

      {/* SECCIÓN 1: CUENTAS POR COBRAR */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-amber-500" /> Cuentas Pendientes
        </h3>

        <div className="space-y-4">
          {pendingDeals.length > 0 ? (
            pendingDeals.map((deal) => (
              <div
                key={deal.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 bg-slate-50 rounded-lg hover:border-blue-200 transition-colors"
              >
                <div className="flex-1 mb-4 sm:mb-0">
                  <h4 className="font-semibold text-slate-900">{deal.title}</h4>
                  <p className="text-sm text-slate-500">{deal.clients?.name}</p>

                  {/* Barra de progreso de pago */}
                  <div className="mt-3 flex items-center gap-3 max-w-md">
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div
                        className="bg-emerald-500 h-2.5 rounded-full"
                        style={{ width: `${deal.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-slate-500 min-w-[12]">
                      {deal.progress.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                      Deuda Total
                    </p>
                    <p className="text-lg font-bold text-amber-600">
                      $
                      {deal.balance.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => openPaymentModal(deal)}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" /> Abonar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              ¡Excelente! No tienes cuentas por cobrar pendientes.
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN 2: HISTORIAL DE PAGOS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-500" /> Historial de
            Ingresos
          </h3>
          <button
            onClick={handleExportPayments}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border border-emerald-200"
          >
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>

        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-left border-separate border-spacing-0">
            <thead className="bg-white text-slate-500 font-medium sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 bg-white">Fecha</th>
                <th className="px-6 py-3 bg-white">Cliente / Trato</th>
                <th className="px-6 py-3 bg-white">Método</th>
                <th className="px-6 py-3 text-right bg-white">Abono (USD)</th>
                <th className="px-6 py-3 text-right bg-white">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(payment.created_at).toLocaleDateString("es-VE")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {payment.deals?.clients?.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {payment.deals?.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 uppercase">
                        {payment.method.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">
                      $
                      {Number(payment.amount_paid_usd).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      <div className="flex items-center justify-end gap-3">
                        <div className="flex flex-col items-end">
                          <span>
                            {payment.method.includes("usd") ||
                            payment.method === "zelle"
                              ? `$${Number(payment.total_received_currency).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                              : `Bs ${Number(payment.total_received_currency).toLocaleString("es-VE", { minimumFractionDigits: 2 })}`}
                          </span>
                          {payment.apply_igtf && (
                            <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                              IGTF 3%
                            </span>
                          )}
                        </div>

                        {/* BOTÓN DE PDF */}
                        <button
                          onClick={() => generarReciboPDF(payment)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Descargar Recibo"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    Aún no has registrado ningún pago.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL PARA REGISTRAR PAGO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">
                Registrar Pago
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-6 space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex justify-between items-center">
                <span>Deuda pendiente:</span>
                <span className="font-bold text-lg">
                  $
                  {selectedDeal?.balance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Abono (USD a descontar)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      step="0.01"
                      max={selectedDeal?.balance}
                      required
                      value={amountUsd}
                      onChange={(e) => setAmountUsd(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2.5 focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-blue-600 outline-none bg-white"
                  >
                    <option value="pago_movil">Pago Móvil (Bs)</option>
                    <option value="transfer_ves">Transferencia (Bs)</option>
                    <option value="cash_usd">Efectivo ($)</option>
                    <option value="zelle">Zelle ($)</option>
                  </select>
                </div>
              </div>

              {(paymentMethod === "pago_movil" ||
                paymentMethod === "transfer_ves") && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tasa BCV del Día
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    placeholder="Ej. 36.50"
                    value={bcvRate}
                    onChange={(e) => setBcvRate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-600 outline-none"
                  />
                </div>
              )}

              {paymentMethod === "cash_usd" && (
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <input
                    type="checkbox"
                    id="igtf"
                    checked={applyIgtf}
                    onChange={(e) => setApplyIgtf(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <label
                    htmlFor="igtf"
                    className="text-sm font-medium text-slate-700"
                  >
                    Cobrar 3% de IGTF
                  </label>
                </div>
              )}

              {/* CONVERSIÓN EN VIVO */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">
                  Total a recibir por el cliente:
                </span>
                <span className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-blue-500" />
                  {paymentMethod.includes("usd") || paymentMethod === "zelle"
                    ? `$${calculateTotalReceived().toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                    : `Bs ${calculateTotalReceived().toLocaleString("es-VE", { minimumFractionDigits: 2 })}`}
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-emerald-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Procesando pago..." : "Registrar Pago"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
