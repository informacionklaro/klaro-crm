"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  Receipt,
  Settings,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname(); // Para saber en qué página estamos y pintar el botón activo
  const router = useRouter();

  // Enlaces principales de tu CRM
  const navigation = [
    { name: "Resumen", href: "/dashboard", icon: LayoutDashboard },
    { name: "Pipeline", href: "/dashboard/pipelines", icon: KanbanSquare },
    { name: "Clientes", href: "/dashboard/clientes", icon: Users },
    { name: "Cobranza", href: "/dashboard/cobranza", icon: Receipt },
    { name: "Equipo", href: "/dashboard/equipo", icon: Users },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20 bg-slate-900">
      {" "}
      <div className="flex flex-col flex-1 min-h-0 bg-slate-900 border-r border-slate-800">
        {/* Logo de la Consola */}
        <div className="flex items-center h-16 flex-shrink-0 px-6 bg-slate-950">
          <span className="text-2xl font-extrabold text-blue-500 tracking-tight">
            Klaro<span className="text-slate-100">CRM</span>
          </span>
        </div>

        {/* Menú de Navegación */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sección inferior (Configuración y Salir) */}
        <div className="flex-shrink-0 flex flex-col p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/dashboard/configuracion"
            className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Settings className="mr-3 flex-shrink-0 h-5 w-5 text-slate-400 group-hover:text-white" />
            Configuración
          </Link>
          <button
            onClick={handleLogout}
            className="group flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-slate-400 group-hover:text-red-400" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
