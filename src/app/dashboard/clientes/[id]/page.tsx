"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Hash,
  DollarSign,
  Briefcase,
  Receipt,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  StickyNote,
} from "lucide-react";
import { generarReciboPDF } from "@/lib/pdfGenerator";

export default function ClienteDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState<any>(null);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const loadClienteData = useCallback(async () => {
    setLoading(true);

    // 1. Datos del Cliente
    const { data: clienteData } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    // 2. Proyectos (Deals) del Cliente
    const { data: dealsData } = await supabase
      .from("deals")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false });

    // 3. Todos los pagos asociados a los tratos de este cliente
    // (Usamos el ID del cliente para filtrar a través de los tratos)
    const { data: paymentsData } = await supabase
      .from("payments")
      .select("*, deals!inner(client_id, title)")
      .eq("deals.client_id", id)
      .order("created_at", { ascending: false });

    setCliente(clienteData);
    setProyectos(dealsData || []);
    setPagos(paymentsData || []);
    setLoading(false);
    setNotes(clienteData.notes || "");
  }, [id]);

  // 3. Función para guardar
  const saveNotes = async () => {
    setIsSavingNotes(true);
    const { error } = await supabase
      .from("clients")
      .update({ notes: notes })
      .eq("id", id);

    if (error) alert("Error al guardar notas");
    setIsSavingNotes(false);
  };

  useEffect(() => {
    loadClienteData();
  }, [loadClienteData]);

  if (loading)
    return (
      <div className="p-8 text-slate-500 animate-pulse">
        Cargando expediente...
      </div>
    );
  if (!cliente)
    return <div className="p-8 text-red-500">Cliente no encontrado.</div>;

  // Estadísticas Rápidas
  const totalInvertido = proyectos.reduce(
    (acc, curr) => acc + Number(curr.amount_usd),
    0,
  );
  const totalPagado = pagos.reduce(
    (acc, curr) => acc + Number(curr.amount_paid_usd),
    0,
  );
  const deudaPendiente = totalInvertido - totalPagado;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Botón Volver y Cabecera */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al directorio
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-start gap-5">
            <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {cliente.name}
              </h2>
              <div className="flex flex-wrap gap-4 mt-2 text-slate-500 text-sm">
                <span className="flex items-center gap-1">
                  <Hash className="w-4 h-4" /> {cliente.doc_type}-
                  {cliente.doc_number}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" /> {cliente.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" /> {cliente.phone}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={`https://wa.me/58${cliente.phone.replace(/^0/, "")}`}
              target="_blank"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
            <StickyNote className="w-4 h-4 text-amber-500" /> Notas Internas
          </h3>
          <button
            onClick={saveNotes}
            disabled={isSavingNotes}
            className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            {isSavingNotes ? "Guardando..." : "Guardar Nota"}
          </button>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Escribe aquí detalles importantes: preferencias de pago, contactos secundarios, recordatorios..."
          className="w-full h-24 p-4 text-sm text-slate-600 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100 outline-none resize-none placeholder:text-slate-400"
        />
        <p className="text-[10px] text-slate-400 mt-2 italic">
          * Estas notas solo son visibles para tu equipo de trabajo.
        </p>
      </div>
      {/* Grid de KPIs del Cliente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Lifetime Value
          </p>
          <p className="text-2xl font-black text-slate-900">
            ${totalInvertido.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Total facturado históricamente
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Pagado
          </p>
          <p className="text-2xl font-black text-emerald-600">
            ${totalPagado.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Total recaudado</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          {deudaPendiente > 0 && (
            <div className="absolute top-0 right-0 w-1 h-full bg-amber-500"></div>
          )}
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Deuda Pendiente
          </p>
          <p
            className={`text-2xl font-black ${deudaPendiente > 0 ? "text-amber-600" : "text-slate-300"}`}
          >
            ${deudaPendiente.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Saldo por cobrar</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historial de Proyectos */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" /> Proyectos
            </h3>
            <span className="text-xs bg-slate-100 px-2 py-1 rounded-md font-bold text-slate-500">
              {proyectos.length}
            </span>
          </div>
          <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
            {proyectos.map((p) => (
              <div
                key={p.id}
                className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="font-bold text-slate-800 text-sm">{p.title}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">
                    {p.stage}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">
                    ${Number(p.amount_usd).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400">{p.deadline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historial de Pagos / Recibos */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-500" /> Pagos Recibidos
            </h3>
          </div>
          <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
            {pagos.map((p) => (
              <div
                key={p.id}
                className="p-4 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => generarReciboPDF(p)}
                    className="p-2 bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      Abono {p.deals?.title}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase">
                      {p.method.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-600">
                    +${Number(p.amount_paid_usd).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(p.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
