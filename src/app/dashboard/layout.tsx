"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/dashboard/sidebar";
import { Lock, Crown, Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Resetear estados al cambiar de ruta o detectar cambios de auth
    setIsExpired(false);

    const checkTrialStatus = async () => {
      try {
        setLoading(true);

        // 1. Obtener sesión actual
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.push("/login");
          return;
        }

        // 2. Traer perfil y tenant con un JOIN
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("*, tenants(*)")
          .eq("id", session.user.id)
          .single();

        if (profileError || !userProfile) {
          // Si no hay perfil aún (nuevo registro), no bloqueamos
          setLoading(false);
          return;
        }

        setUserData(userProfile);
        const tenant = userProfile.tenants;

        if (tenant && tenant.subscription_plan === "trial") {
          const createdAt = new Date(tenant.created_at);
          const trialEndsAt = new Date(
            createdAt.getTime() + 14 * 24 * 60 * 60 * 1000,
          );
          const now = new Date();

          if (now > trialEndsAt) {
            setIsExpired(true);
          }
        }
      } catch (err) {
        console.error("Error en el guardián del dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    checkTrialStatus();
  }, [router, pathname]); // Se dispara al cambiar de ruta

  // Pantalla de carga limpia
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-500 text-sm font-medium">
            Verificando credenciales...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex flex-col flex-1 w-full md:pl-64 relative">
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 z-10">
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-900 tracking-tighter">
              {userData?.tenants?.name.split("@")[0].toUpperCase() ||
                "KLARO CRM"}
            </h1>
            <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">
              Workspace
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">
                {userData?.name || "Usuario"}
              </p>
              <p className="text-[10px] text-slate-500 uppercase font-medium">
                {userData?.role === "tenant_admin"
                  ? "🔥 Administrador"
                  : "⚡ Vendedor"}
              </p>
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              {userData?.name?.charAt(0) || "U"}
            </div>
          </div>
        </header>

        {/* --- CAPA DE BLOQUEO CONDICIONAL --- */}
        {isExpired && (
          <div className="absolute inset-0 top-16 z-50 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md px-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="mx-auto bg-amber-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 rotate-3">
                <Crown className="w-8 h-8 text-amber-500" />
              </div>

              <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                Periodo de prueba agotado
              </h2>

              <p className="text-slate-600 mb-8 text-sm leading-relaxed">
                {userData?.role === "tenant_admin"
                  ? "Tu tiempo de prueba ha terminado. Activa tu suscripción para seguir gestionando tu equipo y clientes."
                  : "El acceso ha sido pausado. Por favor, solicita al administrador que actualice el plan de la empresa."}
              </p>

              {userData?.role === "tenant_admin" ? (
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 mb-4 group">
                  <Lock className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Pásate a Premium
                </button>
              ) : (
                <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-500 mb-4 border border-slate-100 font-medium">
                  Esperando renovación por parte del administrador...
                </div>
              )}

              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setIsExpired(false); // Limpieza manual antes de redirigir
                  router.push("/login");
                }}
                className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors tracking-widest uppercase"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}

        <main
          className={`flex-1 overflow-y-auto p-6 md:p-8 transition-all duration-700 ${isExpired ? "blur-md pointer-events-none grayscale-[0.5]" : ""}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
