"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const router = useRouter();
  const [view, setView] = useState<"login" | "register">("login");

  // Estados del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [docType, setDocType] = useState("V");
  const [docNumber, setDocNumber] = useState("");

  // Nuevos estados para el Teléfono
  const [phoneCode, setPhoneCode] = useState("0414");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Estados de carga y mensajes
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    setMessage({ type: "", text: "" });
    setPassword("");
    setConfirmPassword("");
  }, [view]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      if (view === "register") {
        // Validaciones de Registro
        if (password !== confirmPassword)
          throw new Error("Las contraseñas no coinciden.");
        if (password.length < 6)
          throw new Error("La contraseña debe tener al menos 6 caracteres.");
        if (!docNumber)
          throw new Error("El número de documento es obligatorio.");
        if (phoneNumber.length !== 7)
          throw new Error(
            "El número de teléfono debe tener exactamente 7 dígitos.",
          );

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              document_type: docType,
              document_number: docNumber,
              // Guardamos el teléfono concatenado para facilitar su uso luego
              phone: `${phoneCode}${phoneNumber}`,
            },
          },
        });

        if (error) throw error;

        setMessage({
          type: "success",
          text: "¡Registro exitoso! Iniciando panel...",
        });
        setTimeout(() => {
          setView("login");
          setMessage({
            type: "success",
            text: "Ahora inicia sesión con tu nueva cuenta.",
          });
        }, 1500);
      } else {
        // Lógica de Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw new Error("Correo o contraseña incorrectos.");

        router.push("/dashboard");
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-white">
      {/* PANEL DEL FORMULARIO */}
      <div
        className={`absolute inset-y-0 left-0 w-full md:w-1/2 transition-transform duration-700 ease-in-out z-10 bg-white flex flex-col justify-center px-8 sm:px-16 lg:px-24 
        ${view === "register" ? "md:translate-x-full" : "translate-x-0"}`}
      >
        <div className="mx-auto w-full max-w-md transition-opacity duration-500">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Klaro
            </h1>
            <h2 className="mt-2 text-lg text-slate-600">
              {view === "login"
                ? "Bienvenido de vuelta"
                : "Crea tu cuenta gratis"}
            </h2>
          </div>

          {/* Redujimos un poco el space-y para que los campos nuevos quepan mejor */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {view === "register" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <label className="block text-sm font-medium text-slate-700">
                  Identidad (Cédula/RIF)
                </label>
                <div className="mt-1 flex gap-2">
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="block w-20 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                  >
                    <option value="V">V</option>
                    <option value="E">E</option>
                    <option value="J">J</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={docNumber}
                    onChange={(e) =>
                      setDocNumber(e.target.value.replace(/\D/g, ""))
                    } // Solo números
                    placeholder="12345678"
                    className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}

            {/* Nuevo campo de Teléfono */}
            {view === "register" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <label className="block text-sm font-medium text-slate-700">
                  Teléfono (WhatsApp)
                </label>
                <div className="mt-1 flex gap-2">
                  <select
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    className="block w-24 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                  >
                    <option value="0412">0412</option>
                    <option value="0422">0422</option>
                    <option value="0414">0416</option>
                    <option value="0426">0426</option>
                    <option value="0414">0414</option>
                    <option value="0424">0424</option>
                  </select>
                  <input
                    type="text"
                    required
                    maxLength={7}
                    value={phoneNumber}
                    // Forzamos que solo se puedan escribir números
                    onChange={(e) =>
                      setPhoneNumber(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="1234567"
                    className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {view === "register" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <label className="block text-sm font-medium text-slate-700">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            )}

            {message.text && (
              <div
                className={`p-4 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors disabled:opacity-50 mt-2"
            >
              {loading
                ? "Procesando..."
                : view === "login"
                  ? "Ingresar a mi cuenta"
                  : "Crear mi cuenta"}
            </button>

            <div className="text-center text-sm text-slate-600 mt-4">
              {view === "login"
                ? "¿No tienes una cuenta? "
                : "¿Ya tienes una cuenta? "}
              <button
                type="button"
                onClick={() => setView(view === "login" ? "register" : "login")}
                className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
              >
                {view === "login" ? "Regístrate gratis" : "Inicia sesión"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* PANEL DE BRANDING */}
      <div
        className={`hidden md:flex absolute inset-y-0 right-0 w-1/2 transition-transform duration-700 ease-in-out z-0 bg-slate-900 flex-col items-center justify-center px-16 text-center
        ${view === "register" ? "-translate-x-full" : "translate-x-0"}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-slate-900 opacity-90"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight transition-all duration-500">
            {view === "login" ? (
              <>
                Tus ventas y cobros bajo control.
                <br />
                Sin enredos.
              </>
            ) : (
              <>Únete a los negocios que tienen las cuentas claras.</>
            )}
          </h2>
          <p className="text-blue-100 text-lg max-w-md transition-all duration-500">
            {view === "login"
              ? "El CRM diseñado para mantener las cuentas claras, controlar pagos parciales y gestionar tu pipeline sin estrés."
              : "Configura tu pipeline en minutos y empieza a registrar tus cobros multimoneda hoy mismo."}
          </p>
        </div>
      </div>
    </div>
  );
}
