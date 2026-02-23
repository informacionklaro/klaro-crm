"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { UserPlus, Mail, Shield, Trash2, X, Users, Star } from "lucide-react";

export default function EquipoPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);

  // Estados para el Modal de Invitación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadTeam = useCallback(async () => {
    setLoading(true);

    // 1. Obtener mi sesión para saber quién soy
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      const { data: me } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();
      setCurrentAdmin(me);
    }

    // 2. Cargar todos los usuarios de MI empresa (Tenant)
    const { data: usersData } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: true });

    if (usersData) setTeam(usersData);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const handleInviteMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (team.length >= 3) {
      alert("Has alcanzado el límite de 3 usuarios para el plan Trial.");
      return;
    }

    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;

    /* NOTA: En un SaaS real, aquí usarías supabase.auth.admin.inviteUserByEmail.
       Para esta versión MVP, vamos a simular la invitación creando el registro 
       en la tabla 'users'. El usuario luego se registraría con ese mismo correo.
    */

    const { error } = await supabase.from("users").insert([
      {
        id: crypto.randomUUID(), // ID temporal hasta que se registre realmente
        tenant_id: currentAdmin.tenant_id,
        name: name,
        email: email,
        role: "sales_rep", // Los invitados son vendedores por defecto
      },
    ]);

    if (error) {
      alert("Error al invitar: " + error.message);
    } else {
      await loadTeam();
      setIsModalOpen(false);
    }
    setIsSaving(false);
  };

  const deleteMember = async (id: string, role: string) => {
    if (role === "tenant_admin") {
      alert("No puedes eliminar al administrador principal.");
      return;
    }
    if (confirm("¿Eliminar a este miembro del equipo?")) {
      await supabase.from("users").delete().eq("id", id);
      await loadTeam();
    }
  };

  if (loading)
    return <div className="p-8 text-slate-500">Cargando equipo...</div>;

  const isLimitReached = team.length >= 3;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Gestión de Equipo
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Tienes {team.length} de 3 espacios utilizados.
          </p>
        </div>

        {currentAdmin?.role === "tenant_admin" && (
          <button
            disabled={isLimitReached}
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm
              ${
                isLimitReached
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
          >
            <UserPlus className="w-4 h-4" />
            {isLimitReached ? "Límite alcanzado" : "Invitar Miembro"}
          </button>
        )}
      </div>

      {/* Grid de Miembros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member) => (
          <div
            key={member.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group"
          >
            {member.role === "tenant_admin" && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" /> ADMIN
              </div>
            )}

            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg">
                {member.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 leading-tight">
                  {member.name}
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-[150px]">
                  {member.email}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {member.role === "tenant_admin" ? "Acceso Total" : "Vendedor"}
              </span>

              {currentAdmin?.role === "tenant_admin" &&
                member.role !== "tenant_admin" && (
                  <button
                    onClick={() => deleteMember(member.id, member.role)}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
            </div>
          </div>
        ))}

        {/* Espacio vacío sugerente */}
        {team.length < 3 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-all group"
          >
            <div className="bg-slate-50 p-3 rounded-full mb-2 group-hover:bg-blue-50 transition-colors">
              <UserPlus className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium">Agregar colaborador</span>
          </button>
        )}
      </div>

      {/* MODAL DE INVITACIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Invitar al Equipo
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInviteMember} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-600 outline-none"
                  placeholder="Ej. Miguel Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-600 outline-none"
                  placeholder="miguel@empresa.com"
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">
                  Este usuario tendrá rol de <b>Vendedor</b>. Podrá ver
                  clientes, crear tratos y registrar cobranzas, pero no podrá
                  invitar a más personas.
                </p>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? "Enviando..." : "Confirmar Invitación"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
