"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push("/admin/dashboard");
      } else {
        setError(data.message || "Acceso incorrecto. Intente de nuevo.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-dark min-h-screen flex flex-col justify-center items-center p-6 text-slate-100 bg-premium-mesh-dark">
      <div className="w-full max-w-md bg-brand-charcoal border border-brand-border p-8 rounded-2xl shadow-2xl relative">
        {/* Glow decoration */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-brand-blue/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center justify-center mb-8">
          <Image
            src="/assets/images/logo.png"
            alt="Logo Zirian"
            width={180}
            height={50}
            priority
            className="h-10 w-auto object-contain mb-4"
          />
          <h2 className="font-tech text-sm uppercase tracking-widest text-brand-blue font-bold">
            Zirian Control Center
          </h2>
          <p className="text-[11px] text-slate-500 mt-1 font-tech">
            SISTEMA DE ADMINISTRACIÓN Y CRM
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2 font-tech"
            >
              Clave de Seguridad Administrativa
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••••"
              className="w-full bg-brand-dark border border-brand-border focus:border-brand-blue focus:ring-1 focus:ring-brand-blue text-white px-4 py-3 text-sm rounded-xl focus:outline-none transition"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl text-center">
              ⚠️ {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-blue to-brand-blue-dark hover:from-brand-blue hover:to-brand-blue-dark text-white font-title font-black uppercase tracking-widest text-xs py-4 rounded-xl transition duration-300 hover:scale-[1.02] shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {loading ? "VERIFICANDO..." : "ACCEDER AL PORTAL"}
            </button>
          </div>
        </form>
      </div>

      <footer className="mt-12 text-[10px] text-slate-600 font-tech uppercase tracking-wider">
        Zirian Control Center • Desarrollo de Alta Ingeniería
      </footer>
    </div>
  );
}
