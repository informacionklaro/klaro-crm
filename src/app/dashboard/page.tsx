"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  DollarSign,
  Users,
  Target,
  Activity,
  TrendingUp,
  Download,
  Bell,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { exportToExcel } from "@/lib/export";

type keyNotFound = "prospecto" | "negociacion" | "ganado" | "perdido";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    cobrado: 0,
    porCobrar: 0,
    tratosActivos: 0,
    totalClientes: 0,
  });
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeMetric, setActiveMetric] = useState<
    "ingresos" | "deuda" | "proyectos"
  >("ingresos");

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // 1. Cargar KPIs básicos
        const { count: clientsCount } = await supabase
          .from("clients")
          .select("*", { count: "exact", head: true });
        const { data: deals } = await supabase
          .from("deals")
          .select("id, amount_usd, stage");
        const { data: payments } = await supabase
          .from("payments")
          .select("amount_paid_usd, created_at");
        const { data: activity } = await supabase
          .from("activity_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (deals) {
          // Lógica de Funnel
          const stagesCount = {
            prospecto: 0,
            negociacion: 0,
            ganado: 0,
            entregado: 0,
            perdido: 0,
          };
          deals.forEach((d) => {
            const stage = d.stage as keyof typeof stagesCount;
            if (stagesCount[stage] !== undefined) {
              stagesCount[stage] += 1;
            }
          });

          setFunnelData([
            {
              name: "Prospectos",
              cantidad: stagesCount.prospecto,
              color: "#94a3b8",
            },
            {
              name: "Negociación",
              cantidad: stagesCount.negociacion,
              color: "#fbbf24",
            },
            {
              name: "Producción",
              cantidad: stagesCount.ganado,
              color: "#3b82f6",
            },
          ]);

          const totalCobrado = (payments || []).reduce(
            (acc, curr) => acc + Number(curr.amount_paid_usd),
            0,
          );
          const totalGanado = deals
            .filter((d) => d.stage === "ganado" || d.stage === "entregado")
            .reduce((acc, curr) => acc + Number(curr.amount_usd), 0);

          setStats({
            cobrado: totalCobrado,
            porCobrar: Math.max(0, totalGanado - totalCobrado),
            tratosActivos: deals.filter(
              (d) => d.stage !== "entregado" && d.stage !== "perdido",
            ).length,
            totalClientes: clientsCount || 0,
          });
        }

        // 2. Procesar datos para el gráfico de área (Ingresos Mensuales)
        if (payments) {
          const monthNames = [
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
          const group = payments.reduce((acc: any, curr) => {
            const date = new Date(curr.created_at);
            const label = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
            acc[label] = (acc[label] || 0) + Number(curr.amount_paid_usd);
            return acc;
          }, {});
          setChartData(
            Object.keys(group).map((k) => ({ name: k, ingresos: group[k] })),
          );
        }

        if (payments && deals) {
          const monthNames = [
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
          const group: any = {};

          payments.forEach((p) => {
            const date = new Date(p.created_at);
            const label = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
            if (!group[label])
              group[label] = {
                name: label,
                ingresos: 0,
                deuda: 0,
                proyectos: 0,
              };
            group[label].ingresos += Number(p.amount_paid_usd);
          });

          // Puedes añadir lógica similar para contar proyectos o sumar deuda por mes
          setChartData(Object.values(group));
        }

        if (activity) setLogs(activity);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading)
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">
            Panel de Control
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Visualización de métricas en tiempo real
          </p>
        </div>
        <button
          onClick={() => exportToExcel(chartData, "Reporte_Mensual")}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
        >
          <Download className="w-4 h-4" /> Exportar Datos
        </button>
      </div>
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <DollarSign className="w-5 h-5 text-emerald-500 mb-2" />
          <p className="text-2xl font-black text-slate-900">
            ${stats.cobrado.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase">
            Ingresos Reales
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <Activity className="w-5 h-5 text-amber-500 mb-2" />
          <p className="text-2xl font-black text-slate-900">
            ${stats.porCobrar.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase">
            Por Cobrar
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <Target className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-2xl font-black text-slate-900">
            {stats.tratosActivos}
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase">
            Proyectos Activos
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <Users className="w-5 h-5 text-purple-500 mb-2" />
          <p className="text-2xl font-black text-slate-900">
            {stats.totalClientes}
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase">
            Clientes
          </p>
        </div>
      </div>

      <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="font-black text-slate-900 text-lg">
              Análisis de Rendimiento
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Visualización mensual de la empresa
            </p>
          </div>

          {/* Selector de Métrica Estilizado */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(["ingresos", "deuda", "proyectos"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setActiveMetric(m)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  activeMetric === m
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={
                      activeMetric === "ingresos"
                        ? "#10b981"
                        : activeMetric === "deuda"
                          ? "#f59e0b"
                          : "#3b82f6"
                    }
                    stopOpacity={0.2}
                  />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  activeMetric === "proyectos" ? value : `$${value}`
                }
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke={
                  activeMetric === "ingresos"
                    ? "#10b981"
                    : activeMetric === "deuda"
                      ? "#f59e0b"
                      : "#3b82f6"
                }
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorMetric)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* FEED DE ACTIVIDAD */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" /> Actividad Reciente
          </h3>
          <div className="space-y-6">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                  <div>
                    <p className="text-xs text-slate-600 leading-tight">
                      <span className="font-bold text-slate-900">
                        {log.user_name}
                      </span>{" "}
                      {log.action}{" "}
                      <span className="font-bold text-blue-600">
                        {log.entity_name}
                      </span>
                    </p>
                    <p className="text-[9px] text-slate-400 mt-1 font-black uppercase tracking-tighter">
                      {new Date(log.created_at).toLocaleDateString()} -{" "}
                      {new Date(log.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-10">
                No hay actividad registrada aún.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
