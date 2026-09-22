'use client';

import { useState } from 'react';
import { Activity, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Zap, Server, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { checkSyscomHealthAction } from '@/app/actions/syscom-settings';

interface SyscomStatusCardProps {
  initialHealth: {
    success: boolean;
    status: string;
    error?: string;
    lastCheck: string;
    exchangeRate: number;
  };
}

export function SyscomStatusCard({ initialHealth }: SyscomStatusCardProps) {
  const [health, setHealth] = useState(initialHealth);
  const [isChecking, setIsChecking] = useState(false);

  const handleRecheck = async () => {
    setIsChecking(true);
    try {
      const res = await checkSyscomHealthAction();
      setHealth(res);
    } catch (e: any) {
      setHealth({
        success: false,
        status: 'Error',
        error: e?.message || 'Error al conectar',
        lastCheck: new Date().toISOString(),
        exchangeRate: 20.0
      });
    } finally {
      setIsChecking(false);
    }
  };

  const formattedDate = health.lastCheck 
    ? new Date(health.lastCheck).toLocaleString('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'medium'
      })
    : 'No registrada';

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-6 shadow-xl">
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg border ${
            health.success 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-tech font-bold uppercase tracking-wider text-white">
                Estado del Conector Syscom
              </h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-tech font-bold uppercase tracking-wider border ${
                health.success
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/15 text-red-400 border-red-500/30'
              }`}>
                {health.success ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    En Línea / Operativo
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    Error de Conexión
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitoreo de comunicación en tiempo real con developers.syscom.mx
            </p>
          </div>
        </div>

        <Button
          onClick={handleRecheck}
          disabled={isChecking}
          variant="outline"
          size="sm"
          className="font-tech text-xs uppercase tracking-wider border-slate-700 hover:bg-slate-800 text-slate-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isChecking ? 'animate-spin text-brand-cyan' : ''}`} />
          {isChecking ? 'Verificando...' : 'Verificar Conexión Ahora'}
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-tech uppercase tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5 text-brand-blue" />
            Última Verificación Exitosa
          </div>
          <p className="text-sm font-semibold text-white font-mono">{formattedDate}</p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-tech uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Tipo de Cambio Syscom
          </div>
          <p className="text-sm font-semibold text-amber-400 font-mono">
            ${Number(health.exchangeRate || 20.0).toFixed(2)} MXN
          </p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-tech uppercase tracking-wider mb-1">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            Modo de Operación
          </div>
          <p className="text-sm font-semibold text-slate-200">En Vivo (Live REST API)</p>
        </div>
      </div>

      {/* Error alert if any */}
      {!health.success && health.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-red-400 uppercase tracking-wider font-tech">Detalle del Error</p>
            <p className="text-red-200 mt-1">{health.error}</p>
          </div>
        </div>
      )}

      {/* Architecture & Mechanics Technical Explanation */}
      <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-4 space-y-3">
        <h4 className="text-xs font-tech font-bold uppercase tracking-widest text-brand-cyan flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Mecánica de Catálogo y Tolerancia a Fallos
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div>
            <span className="font-bold text-white block mb-0.5">1. Consulta en Vivo (Sin Replicación Masiva):</span>
            Los productos y existencias se consultan directamente en la API oficial bajo demanda al cotizar. No se descarga el catálogo entero a la base de datos local para no saturar el almacenamiento.
          </div>
          <div>
            <span className="font-bold text-white block mb-0.5">2. Frecuencia y Caché ISR (1 hora):</span>
            El token OAuth se renueva automáticamente antes de expirar. Las búsquedas de productos y el tipo de cambio se cachean por 3,600 segundos (1 hora) para proteger la cuota de peticiones.
          </div>
          <div>
            <span className="font-bold text-white block mb-0.5">3. Tolerancia a Fallos (Fallback):</span>
            Si la API de Syscom no responde, el sistema degrada de forma segura: devuelve un catálogo vacío temporal sin romper el cotizador y adopta un tipo de cambio seguro de $20.00 MXN.
          </div>
          <div>
            <span className="font-bold text-white block mb-0.5">4. Filtro de Marcas y Modelos Autorizados:</span>
            Solo se exhiben ítems con existencia confirmada (`stock &gt; 0`) cuyas marcas coincidan con la lista blanca o cuyos modelos/SKUs hayan sido autorizados en las excepciones, omitiendo cualquier ítem en lista negra.
          </div>
        </div>
      </div>
    </div>
  );
}
