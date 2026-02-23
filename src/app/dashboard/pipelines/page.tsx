"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  DollarSign,
  Calendar,
  X,
  Search,
  UserPlus,
  CheckCircle2,
  Clock,
  Download,
} from "lucide-react";
import { exportToExcel } from "@/lib/export";
import { logActivity } from "@/lib/activity";

const formatearFecha = (fechaCorta: string) => {
  if (!fechaCorta) return "Sin fecha";
  try {
    const partes = fechaCorta.split("-");
    if (partes.length !== 3) return fechaCorta;
    const [anio, mes, dia] = partes;
    const meses = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    return `${dia} ${meses[parseInt(mes, 10) - 1]}`;
  } catch (e) {
    return fechaCorta;
  }
};

const stages = [
  { id: "prospecto", name: "Prospectos", color: "bg-slate-200 text-slate-700" },
  {
    id: "negociacion",
    name: "En Negociación",
    color: "bg-amber-100 text-amber-700",
  },
  { id: "ganado", name: "En Producción", color: "bg-blue-100 text-blue-700" },
  {
    id: "entregado",
    name: "Entregado",
    color: "bg-emerald-100 text-emerald-700",
  },
  { id: "perdido", name: "Perdidos", color: "bg-red-100 text-red-700" },
];

export default function PipelinePage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [isSavingDeal, setIsSavingDeal] = useState(false);

  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isSavingClient, setIsSavingClient] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) setUserId(session.user.id);

      const { data: clientsData } = await supabase.from("clients").select("*");
      if (clientsData) setClients(clientsData);

      const { data: dealsData } = await supabase
        .from("deals")
        .select("*, clients(name), payments(amount_paid_usd)")
        .order("created_at", { ascending: false });

      if (dealsData) {
        const mappedDeals = dealsData.map((d) => {
          const totalPaid =
            d.payments?.reduce(
              (acc: number, p: any) => acc + Number(p.amount_paid_usd),
              0,
            ) || 0;
          const progress =
            d.amount_usd > 0 ? (totalPaid / d.amount_usd) * 100 : 0;
          return {
            id: d.id,
            title: d.title,
            clientId: d.client_id,
            clientName: d.clients?.name || "Desconocido",
            value: d.amount_usd,
            stage: d.stage,
            date: d.deadline,
            totalPaid,
            progress: Math.min(progress, 100),
          };
        });
        setDeals(mappedDeals);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowClientDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      (c.doc_number && c.doc_number.includes(clientSearch)),
  );

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedDealId(id);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (!draggedDealId) return;
    setDeals(
      deals.map((deal) =>
        deal.id === draggedDealId ? { ...deal, stage: stageId } : deal,
      ),
    );
    const { error } = await supabase
      .from("deals")
      .update({ stage: stageId })
      .eq("id", draggedDealId);
    if (error) console.error("Error moviendo el trato:", error);
    setDraggedDealId(null);
  };

  const openNewDealModal = () => {
    setSelectedDeal(null);
    setSelectedClient(null);
    setClientSearch("");
    setIsDealModalOpen(true);
  };
  const openEditDealModal = (deal: any) => {
    setSelectedDeal(deal);
    const client = clients.find((c) => c.id === deal.clientId);
    setSelectedClient(client || { name: deal.clientName });
    setClientSearch(deal.clientName);
    setIsDealModalOpen(true);
  };

  const handleSaveDeal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClient || !selectedClient.id) {
      alert("Selecciona o crea un cliente válido.");
      return;
    }
    setIsSavingDeal(true);
    const formData = new FormData(e.currentTarget);
    const dealData = {
      title: formData.get("title") as string,
      client_id: selectedClient.id,
      user_id: userId,
      amount_usd: Number(formData.get("value")),
      deadline: formData.get("date") as string,
    };

    if (selectedDeal) {
      const { data, error } = await supabase
        .from("deals")
        .update(dealData)
        .eq("id", selectedDeal.id)
        .select("*, clients(name), payments(amount_paid_usd)")
        .single();
      if (!error && data) {
        const totalPaid =
          data.payments?.reduce(
            (acc: number, p: any) => acc + Number(p.amount_paid_usd),
            0,
          ) || 0;
        const progress =
          data.amount_usd > 0 ? (totalPaid / data.amount_usd) * 100 : 0;
        setDeals(
          deals.map((d) =>
            d.id === selectedDeal.id
              ? {
                  ...d,
                  title: data.title,
                  clientName: data.clients?.name,
                  clientId: data.client_id,
                  value: data.amount_usd,
                  date: data.deadline,
                  totalPaid,
                  progress: Math.min(progress, 100),
                }
              : d,
          ),
        );
      }
    } else {
      const { data, error } = await supabase
        .from("deals")
        .insert([{ ...dealData, stage: "prospecto" }])
        .select("*, clients(name)")
        .single();
      if (!error && data) {
        setDeals([
          ...deals,
          {
            id: data.id,
            title: data.title,
            clientName: data.clients?.name,
            clientId: data.client_id,
            value: data.amount_usd,
            stage: data.stage,
            date: data.deadline,
            totalPaid: 0,
            progress: 0,
          },
        ]);
      }
    }
    setIsSavingDeal(false);
    setIsDealModalOpen(false);
  };

  const handleSaveFullClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingClient(true);
    const formData = new FormData(e.currentTarget);
    const newClientData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      doc_type: formData.get("doc_type") as string,
      doc_number: formData.get("doc_number") as string,
    };
    const { data, error } = await supabase
      .from("clients")
      .insert([newClientData])
      .select()
      .single();

    await logActivity("movió a 'Ganado' el proyecto:", deals.title);

    if (!error && data) {
      setClients([...clients, data]);
      setSelectedClient(data);
      setClientSearch(data.name);
      setIsClientModalOpen(false);
      setShowClientDropdown(false);
    }
    setIsSavingClient(false);
  };

  const handleExportPipeline = () => {
    const dataToExport = deals.map((d) => ({
      "Nombre del Proyecto": d.title,
      Cliente: d.clientName,
      "Etapa Actual": d.stage.toUpperCase(),
      "Valor Total (USD)": d.value,
      "Monto Abonado (USD)": d.totalPaid,
      "Porcentaje Pagado": `${d.progress.toFixed(0)}%`,
      "Fecha Límite/Entrega": d.date,
    }));
    exportToExcel(dataToExport, "Reporte_Proyectos_Klaro");
  };

  if (loading)
    return (
      <div className="p-8 text-slate-500 font-medium">
        Cargando tu pipeline...
      </div>
    );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Pipeline de Producción
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Controla el flujo de trabajo y monitorea los pagos en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPipeline}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Excel
          </button>
          <button
            onClick={openNewDealModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nuevo Proyecto
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-6 h-full min-w-max">
          {stages.map((stage) => (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
              className="flex flex-col w-80 bg-slate-100/50 rounded-xl border border-slate-200/60 p-4 hover:bg-slate-100/80"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${stage.color}`}
                  >
                    {stage.name}
                  </span>
                  <span className="text-slate-400 text-sm font-medium">
                    {deals.filter((d) => d.stage === stage.id).length}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
                {deals
                  .filter((deal) => deal.stage === stage.id)
                  .map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onClick={() => openEditDealModal(deal)}
                      className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing group"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight pr-2">
                          {deal.title}
                        </h4>
                        {deal.progress >= 100 ? (
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3 h-3" /> Pagado
                          </span>
                        ) : deal.progress > 0 ? (
                          <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" /> Abono{" "}
                            {deal.progress.toFixed(0)}%
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                            Sin Pago
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mb-4 truncate">
                        {deal.clientName}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="flex items-center text-slate-700 font-medium bg-slate-50 px-2 py-1 rounded">
                          <DollarSign className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {deal.value.toLocaleString("en-US")}
                        </div>
                        <div className="flex items-center text-xs text-slate-400">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          {formatearFecha(deal.date)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isDealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-visible animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {selectedDeal ? "Detalles del Proyecto" : "Nuevo Proyecto"}
              </h3>
              <button
                onClick={() => setIsDealModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleSaveDeal}
              className="p-6 space-y-5 overflow-visible"
            >
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cliente
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                      setSelectedClient(null);
                      setShowClientDropdown(true);
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                    placeholder="Buscar empresa o RIF..."
                    className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2.5 focus:border-blue-600 outline-none"
                    autoComplete="off"
                  />
                </div>
                {showClientDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                    {filteredClients.length > 0 ? (
                      <ul className="py-1">
                        {filteredClients.map((client) => (
                          <li
                            key={client.id}
                            onClick={() => {
                              setSelectedClient(client);
                              setClientSearch(client.name);
                              setShowClientDropdown(false);
                            }}
                            className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex flex-col border-b border-slate-50 last:border-0"
                          >
                            <span className="font-semibold text-slate-800 text-sm">
                              {client.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {client.doc_type}-{client.doc_number}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => setIsClientModalOpen(true)}
                          className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-blue-100"
                        >
                          <UserPlus className="w-4 h-4" />
                          Alta de cliente: "{clientSearch}"
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Título del Proyecto
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={selectedDeal?.title || ""}
                  placeholder="Ej. Diseño de Logo"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-600 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Valor Final ($)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      name="value"
                      required
                      min="0"
                      defaultValue={selectedDeal?.value || ""}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2.5 focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fecha de Entrega
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={selectedDeal?.date || ""}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-600 outline-none text-slate-700"
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingDeal}
                  className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSavingDeal ? "Guardando..." : "Guardar Proyecto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isClientModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" /> Alta de Cliente
              </h3>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveFullClient} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Razón Social
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={clientSearch}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-600 outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="contacto@empresa.com"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    name="phone"
                    required
                    placeholder="04141234567"
                    maxLength={11}
                    minLength={11}
                    onInput={(e) =>
                      (e.currentTarget.value = e.currentTarget.value.replace(
                        /\D/g,
                        "",
                      ))
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Identidad Fiscal
                </label>
                <div className="flex gap-2">
                  <select
                    name="doc_type"
                    className="block w-20 rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none"
                  >
                    <option value="J">J</option>
                    <option value="V">V</option>
                    <option value="E">E</option>
                    <option value="G">G</option>
                  </select>
                  <input
                    type="text"
                    name="doc_number"
                    required
                    placeholder="12345678"
                    onInput={(e) =>
                      (e.currentTarget.value = e.currentTarget.value.replace(
                        /\D/g,
                        "",
                      ))
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingClient}
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  {isSavingClient ? "Registrando..." : "Guardar y Continuar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
