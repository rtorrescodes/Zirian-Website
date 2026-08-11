"use client";

import { useEffect } from "react";
import { createNotification } from "@/app/actions/notifications";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to our CRM notification system
    createNotification({
      title: "Error Fatal de Sistema",
      message: `El sitio experimentó un fallo: ${error.message}. Hash: ${error.digest || 'N/A'}`,
      categoria: "Errores"
    }).catch(console.error);
    
    // Log to standard console as well
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-tech">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Algo Salió Mal</h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Hemos registrado este error y notificado al equipo técnico para solucionarlo lo antes posible.
        </p>
        <Button 
          onClick={() => reset()}
          className="w-full bg-brand-blue hover:bg-brand-blue/80 text-slate-950 font-bold tracking-wider uppercase transition-all"
        >
          Intentar de nuevo
        </Button>
      </div>
    </div>
  );
}
