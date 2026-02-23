"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  X,
  Edit,
  Trash2,
  Download,
  ExternalLink,
} from "lucide-react";
import { exportToExcel } from "@/lib/export";
import { logActivity } from "@/lib/activity";
import Link from "next/link";

export default function ClientesPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 1. LEER CLIENTES DE LA BASE DE DATOS (Definido dentro del useEffect)
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando clientes:", error);
      } else {
        setClients(data || []);
      }
      setLoading(false);
    };

    fetchClients();
  }, []); // <-- Al estar todo contenido aquí adentro, React confía en nosotros y el error desaparece.

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email &&
        client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.doc_number && client.doc_number.includes(searchTerm)),
  );

  // --- LÓGICA DEL MODAL ---
  const openNewClientModal = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const openEditClientModal = (client: any) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  // 2. ELIMINAR CLIENTE
  const handleDeleteClient = async (id: string) => {
    if (
      confirm(
        "¿Estás seguro de que deseas eliminar este cliente? Se borrarán también sus tratos.",
      )
    ) {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) {
        alert("Error al eliminar el cliente.");
        console.error(error);
      } else {
        setClients(clients.filter((c) => c.id !== id)); // Quitamos de la vista
      }
    }
  };

  // 3. CREAR O ACTUALIZAR CLIENTE
  const handleSaveClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);

    const clientData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      doc_type: formData.get("doc_type") as string,
      doc_number: formData.get("doc_number") as string,
    };

    if (selectedClient) {
      // ACTUALIZAR (UPDATE)
      const { data, error } = await supabase
        .from("clients")
        .update(clientData)
        .eq("id", selectedClient.id)
        .select()
        .single();

      if (error) {
        alert("Error al actualizar");
      } else {
        setClients(clients.map((c) => (c.id === selectedClient.id ? data : c)));
        setIsModalOpen(false);
      }
    } else {
      // CREAR NUEVO (INSERT)
      const { data, error } = await supabase
        .from("clients")
        .insert([clientData])
        .select()
        .single();

      await logActivity("registró un nuevo cliente:", name);

      if (error) {
        alert("Error al crear. Revisa los datos.");
        console.error(error);
      } else {
        setClients([data, ...clients]); // Lo agregamos al principio de la lista
        setIsModalOpen(false);
      }
    }
    setIsSaving(false);
  };

  const handleExport = () => {
    const dataToExport = clients.map((c) => ({
      "Nombre/Razón Social": c.name,
      Identidad: `${c.doc_type}-${c.doc_number}`,
      Correo: c.email,
      Teléfono: c.phone,
      "Fecha de Registro": new Date(c.created_at).toLocaleDateString("es-VE"),
    }));
    exportToExcel(dataToExport, "Directorio_Clientes");
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Cabecera */}
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" /> Excel
        </button>
        <button
          onClick={openNewClientModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nuevo Cliente
        </button>
      </div>

      {/* Buscador */}
      <div className="flex items-center mb-6">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, correo o RIF/Cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
        <div className="overflow-x-auto custom-scrollbar h-full">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Empresa / Nombre</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Identidad Fiscal</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    Cargando clientes...
                  </td>
                </tr>
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 flex-shrink-0">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <Link
                          href={`/dashboard/clientes/${client.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-2"
                        >
                          {client.name}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />{" "}
                          {client.email || "Sin correo"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />{" "}
                          {client.phone || "Sin teléfono"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {client.doc_type}-{client.doc_number}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditClientModal(client)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No tienes clientes registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {selectedClient ? "Editar Cliente" : "Nuevo Cliente"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Razón Social o Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={selectedClient?.name || ""}
                  placeholder="Ej. Inversiones Klaro C.A."
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
                    defaultValue={selectedClient?.email || ""}
                    placeholder="contacto@empresa.com"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Teléfono (WhatsApp)
                  </label>
                  <input
                    type="text"
                    name="phone"
                    maxLength={11}
                    defaultValue={selectedClient?.phone || ""}
                    onInput={(e) =>
                      (e.currentTarget.value = e.currentTarget.value.replace(
                        /\D/g,
                        "",
                      ))
                    }
                    placeholder="04141234567"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Identidad (RIF/Cédula)
                </label>
                <div className="flex gap-2">
                  <select
                    name="doc_type"
                    defaultValue={selectedClient?.doc_type || "J"}
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
                    defaultValue={selectedClient?.doc_number || ""}
                    onInput={(e) =>
                      (e.currentTarget.value = e.currentTarget.value.replace(
                        /\D/g,
                        "",
                      ))
                    }
                    placeholder="12345678"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Guardando..." : "Guardar Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
